import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '1',
        email: createDto.email,
        password: 'hashed',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      // Mock bcrypt.hash
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const bcrypt = require('bcrypt');
      bcrypt.hash = jest.fn().mockResolvedValue('hashed');

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const existingUser = {
        id: '1',
        email: createDto.email,
        password: 'hashed',
      };

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: '1',
        email,
        password: 'hashed',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const email = 'test@example.com';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const id = '1';
      const mockUser = {
        id,
        email: 'test@example.com',
        password: 'hashed',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockUser);
    });
  });
});
