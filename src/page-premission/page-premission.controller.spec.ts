import { Test, TestingModule } from '@nestjs/testing';
import { PagePremissionController } from './page-premission.controller';
import { PagePremissionService } from './page-premission.service';

describe('PagePremissionController', () => {
  let controller: PagePremissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagePremissionController],
      providers: [PagePremissionService],
    }).compile();

    controller = module.get<PagePremissionController>(PagePremissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
