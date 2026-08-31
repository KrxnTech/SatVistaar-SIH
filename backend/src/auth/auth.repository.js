import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * User Repository
 * 
 * Provides an abstracted data access layer for User entities.
 * Can be replaced seamlessly with a database (PostgreSQL/Prisma, MongoDB, SQLite)
 * without affecting services or controllers.
 */
class UserRepository {
  constructor() {
    this._users = new Map();
    this._initialized = false;
    this._initStorage();
  }

  _initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(USERS_FILE)) {
        const fileContent = fs.readFileSync(USERS_FILE, 'utf8');
        if (fileContent && fileContent.trim()) {
          const parsed = JSON.parse(fileContent);
          if (Array.isArray(parsed)) {
            parsed.forEach(user => {
              if (user && user.id) {
                this._users.set(user.id, user);
              }
            });
          }
        }
      } else {
        this._persistToDisk();
      }
      this._initialized = true;
    } catch (err) {
      console.warn('[UserRepository Warning] Failed to initialize file storage, running in memory-only mode:', err.message);
      this._initialized = true;
    }
  }

  _persistToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const usersArray = Array.from(this._users.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2), 'utf8');
    } catch (err) {
      console.error('[UserRepository Error] Failed to persist users to disk:', err.message);
    }
  }

  /**
   * Find a user by their unique identifier
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    if (!id) return null;
    const user = this._users.get(id);
    return user ? { ...user } : null;
  }

  /**
   * Find a user by normalized email address
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    for (const user of this._users.values()) {
      if (user.email && user.email.toLowerCase() === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  /**
   * Create a new user record
   * @param {object} userData
   * @returns {Promise<object>}
   */
  async create(userData) {
    const id = userData.id || uuidv4();
    const now = new Date().toISOString();

    const newUser = {
      id,
      name: userData.name ? userData.name.trim() : 'User',
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'USER', // 'USER' | 'ADMIN'
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null
    };

    this._users.set(id, newUser);
    this._persistToDisk();
    return { ...newUser };
  }

  /**
   * Update an existing user
   * @param {string} id 
   * @param {object} updateData 
   * @returns {Promise<object|null>}
   */
  async update(id, updateData) {
    const existing = this._users.get(id);
    if (!existing) return null;

    const updatedUser = {
      ...existing,
      ...updateData,
      id: existing.id, // Prevent ID overwrite
      updatedAt: new Date().toISOString()
    };

    this._users.set(id, updatedUser);
    this._persistToDisk();
    return { ...updatedUser };
  }

  /**
   * Delete a user by ID
   * @param {string} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    if (!this._users.has(id)) return false;
    this._users.delete(id);
    this._persistToDisk();
    return true;
  }

  /**
   * Count total registered users
   * @returns {Promise<number>}
   */
  async count() {
    return this._users.size;
  }

  /**
   * Retrieve all users (internal/admin only)
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    return Array.from(this._users.values()).map(u => ({ ...u }));
  }
}

export const userRepository = new UserRepository();
export default userRepository;
