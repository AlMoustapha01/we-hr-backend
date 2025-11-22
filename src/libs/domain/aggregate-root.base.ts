import { BaseEntity } from './entity.base';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestContextService } from '../application/context/AppRequestContext';
import { DomainEvent } from './domain-event.base';
import { LoggerPort } from '../ports/logger.port';

export abstract class AggregateRoot<
  EntityProps,
> extends BaseEntity<EntityProps> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public async publishEvents(
    logger: LoggerPort,
    eventEmitter: EventEmitter2,
  ): Promise<void> {
    await Promise.all(
      this.domainEvents.map(async (event) => {
        const contextInfo = {
          requestId: RequestContextService.getRequestId(),
          time: RequestContextService.getTime(),
          ip: RequestContextService.getIp(),
        };

        logger.debug(
          `[${contextInfo.requestId}] [${contextInfo.time}] [${contextInfo.ip}] ` +
            `"${event.constructor.name}" event published for aggregate ${this.constructor.name} : ${this.id}`,
        );
        return eventEmitter.emitAsync(event.constructor.name, event);
      }),
    );
    this.clearEvents();
  }
}
