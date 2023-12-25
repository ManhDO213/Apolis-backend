import { TestBed, inject } from '@angular/core/testing';

import { PermisosService } from './permisos.service';

describe('PermisosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermisosService]
    });
  });

  it('should be created', inject([PermisosService], (service: PermisosService) => {
    expect(service).toBeTruthy();
  }));
});
