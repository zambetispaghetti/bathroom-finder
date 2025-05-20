import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { User, IUser } from '../../src/models/User'

let mongoServer: MongoMemoryServer

describe('User Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({})
  })

  it('should create a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    }

    const user = await User.create(userData)
    expect(user).toBeDefined()
    expect(user.email).toBe(userData.email)
    expect(user.name).toBe(userData.name)
    expect(user.role).toBe('user') // Default role
    expect(user.password).not.toBe(userData.password) // Password should be hashed
  })

  it('should create a user with home location', async () => {
    const userData = {
      email: 'location@example.com',
      password: 'password123',
      name: 'Location User',
      homeLocation: {
        lat: 40.7128,
        lng: -74.0060,
        address: 'New York, NY, USA',
      },
    }

    const user = await User.create(userData)
    expect(user.homeLocation).toBeDefined()
    expect(user.homeLocation?.lat).toBe(40.7128)
    expect(user.homeLocation?.lng).toBe(-74.0060)
    expect(user.homeLocation?.address).toBe('New York, NY, USA')
  })

  it('should not create user with invalid location coordinates', async () => {
    const userData = {
      email: 'invalid-location@example.com',
      password: 'password123',
      name: 'Invalid Location User',
      homeLocation: {
        lat: 200, // Invalid latitude
        lng: -74.0060,
        address: 'Invalid Location',
      },
    }

    try {
      await User.create(userData)
      expect(true).toBe(false) // Should not reach this point
    } catch (error: any) {
      expect(error.errors['homeLocation.lat']).toBeDefined()
    }
  })

  it('should not create user with invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'password123',
      name: 'Test User',
    }

    try {
      await User.create(userData)
      expect(true).toBe(false) // Should not reach this point
    } catch (error: any) {
      expect(error.errors.email).toBeDefined()
    }
  })

  it('should not create user with short password', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'short',
      name: 'Test User',
    }

    try {
      await User.create(userData)
      expect(true).toBe(false) // Should not reach this point
    } catch (error: any) {
      expect(error.errors.password).toBeDefined()
    }
  })

  it('should not allow duplicate email addresses', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      name: 'First User',
    }

    // Create first user
    await User.create(userData)

    // Attempt to create second user with same email
    const duplicateUserData = {
      ...userData,
      name: 'Second User', // Different name, same email
    }

    try {
      await User.create(duplicateUserData)
      expect(true).toBe(false) // Should not reach this point
    } catch (error: any) {
      expect(error.code).toBe(11000) // MongoDB duplicate key error code
      expect(error.keyPattern.email).toBe(1) // Verify the error is for the email field
    }
  })

  it('should find user by email', async () => {
    const userData = {
      email: 'findme@example.com',
      password: 'password123',
      name: 'Find Me User',
    }

    await User.create(userData)
    const foundUser = await User.findByEmail(userData.email)
    
    expect(foundUser).toBeDefined()
    expect(foundUser?.email).toBe(userData.email)
  })

  it('should compare password correctly', async () => {
    const userData = {
      email: 'compare@example.com',
      password: 'password123',
      name: 'Compare User',
    }

    const user = await User.create(userData)
    const isMatch = await user.comparePassword('password123')
    const isNotMatch = await user.comparePassword('wrongpassword')

    expect(isMatch).toBe(true)
    expect(isNotMatch).toBe(false)
  })

  describe('authenticate', () => {
    const testUser = {
      email: 'auth@example.com',
      password: 'correctPassword123',
      name: 'Auth Test User',
    }

    beforeEach(async () => {
      await User.create(testUser)
    })

    it('should authenticate user with correct credentials', async () => {
      const result = await User.authenticate(testUser.email, testUser.password)
      expect(result).toBeDefined()
      expect(result.email).toBe(testUser.email)
      expect(result.name).toBe(testUser.name)
      expect(result.password).toBeUndefined() // Password should not be returned
    })

    it('should throw error for non-existent email', async () => {
      try {
        await User.authenticate('nonexistent@example.com', 'anypassword')
        expect(true).toBe(false) // Should not reach this point
      } catch (error: any) {
        expect(error.message).toBe('Invalid email or password')
      }
    })

    it('should throw error for incorrect password', async () => {
      try {
        await User.authenticate(testUser.email, 'wrongpassword')
        expect(true).toBe(false) // Should not reach this point
      } catch (error: any) {
        expect(error.message).toBe('Invalid email or password')
      }
    })
  })
}) 