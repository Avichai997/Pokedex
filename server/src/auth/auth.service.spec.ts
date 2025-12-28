import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = { email: 'test@example.com', password: 'password123' };

      mockUsersService.create.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
      };
      const mockToken = 'jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      // Mock bcrypt.compare
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', mockToken);
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Mock bcrypt.compare
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
