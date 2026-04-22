import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getStatus: jest.fn().mockReturnValue({
              name: 'challenge-backend-bidcom',
              status: 'ok',
              environment: 'development',
              docsPath: '/docs',
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the application status payload', () => {
      expect(appController.getStatus()).toEqual({
        name: 'challenge-backend-bidcom',
        status: 'ok',
        environment: 'development',
        docsPath: '/docs',
      });
    });
  });
});
