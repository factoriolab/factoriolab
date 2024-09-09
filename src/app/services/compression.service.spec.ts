import { TestBed } from '@angular/core/testing';

import { CompressionService } from './compression.service';

describe('CompressionService', () => {
  let service: CompressionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('nToId', () => {
    it('should convert n to id', () => {
      expect(service.nToId(600)).toEqual('JY');
    });
  });

  describe('idToN', () => {
    it('should convert id to n', () => {
      expect(service.idToN('JY')).toEqual(600);
    });
  });

  describe('getBase64Code', () => {
    it('should check charCode validity', () => {
      expect(() => service['getBase64Code'](257)).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should check code validity', () => {
      expect(() => service['getBase64Code'](0)).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should return a valid code', () => {
      expect(service['getBase64Code'](45)).toEqual(62);
    });
  });

  describe('bytesToBase64', () => {
    it('should convert Uint8array to string', async () => {
      const z = await service['compress']('abcdefghij');
      const result = service['bytesToBase64'](z);
      expect(result).toEqual('eJxLTEpOSU1Lz8jMAgAVhgP4');
    });

    it('should handle trailing octets', async () => {
      let z = await service['compress']('aa');
      expect(service['bytesToBase64'](z)).toEqual('eJxLTAQAASUAww__');
      z = await service['compress']('aaa');
      expect(service['bytesToBase64'](z)).toEqual('eJxLTEwEAAJJASQ_');
    });
  });

  describe('inflate', () => {
    it('should attempt to mend a bad zip', async () => {
      spyOn(console, 'warn');
      spyOn(service as any, 'inflateMend').and.callThrough();
      await expectAsync(service.inflate('abcde')).toBeRejected();
      expect(console.warn).toHaveBeenCalled();
      expect(service['inflateMend']).toHaveBeenCalledTimes(3);
    });
  });

  describe('inflateMend', () => {
    it('should attempt to inflate the zip and warn if successful', async () => {
      spyOn(console, 'warn');
      const result = await service['inflateMend']('eJxLTAQAASUAww_', '_');
      expect(result).toEqual('aa');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should assume failure if return is empty/null', async () => {
      spyOn(service as any, 'inflateStr').and.returnValue(Promise.resolve(''));
      await expectAsync(
        service['inflateMend']('eJxLTAQAASUAww_', '_'),
      ).toBeRejected();
    });
  });

  describe('base64ToBytes', () => {
    it('should check for invalid string length', () => {
      expect(() => service['base64ToBytes']('aaa')).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should check for invalid missing octets', () => {
      expect(() => service['base64ToBytes']('_aaa')).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should handle trailing octets', async () => {
      let z = await service['decompress'](
        service['base64ToBytes']('eJxLTAQAASUAww__'),
      );
      expect(z).toEqual('aa');
      z = await service['decompress'](
        service['base64ToBytes']('eJxLTEwEAAJJASQ_'),
      );
      expect(z).toEqual('aaa');
    });

    it('should convert string to bytes', async () => {
      const result = await service['decompress'](
        service['base64ToBytes']('eJxLTEpOSU1Lz8jMAgAVhgP4'),
      );
      expect(result).toEqual('abcdefghij');
    });
  });
});
