import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@/constants';
import { EchoController } from '@/controllers/echo.controller';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';

describe('EchoController', () => {
  it('responds 200 with the message and its length', () => {
    const controller = new EchoController();
    const req = createMockRequest({ body: { message: 'hello' } });
    const res = createMockResponse();

    controller.echo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { message: 'hello', length: 5 },
    });
  });

  it('works when echo is detached from the controller instance (arrow-property binding)', () => {
    const controller = new EchoController();
    const { echo } = controller;
    const res = createMockResponse();

    echo(createMockRequest({ body: { message: 'hi' } }), res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
  });
});
