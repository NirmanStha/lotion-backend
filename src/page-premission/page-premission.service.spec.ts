import { Test, TestingModule } from '@nestjs/testing';
import { PagePremissionService } from './page-premission.service';

describe('PagePremissionService', () => {
  let service: PagePremissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagePremissionService],
    }).compile();

    service = module.get<PagePremissionService>(PagePremissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
