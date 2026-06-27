import type { DataStoreClient } from '@/db/types';
import type { Consumer, Kafka, Producer } from 'kafkajs';
import type { Logger } from 'pino';

export type MessageHandler = (payload: { topic: string; value: string }) => Promise<void>;

/**
 * Kafka client — STUB. Exposes idiomatic produce/consume helpers. Real broker
 * wiring is intentionally deferred.
 */
export class KafkaClient implements DataStoreClient {
  readonly name = 'kafka';
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor(
    private readonly brokers: string[],
    private readonly clientId: string,
    private readonly logger: Logger,
  ) {}

  get isConnected(): boolean {
    return this.kafka !== null && this.producer !== null && this.consumer !== null;
  }

  async connect(): Promise<void> {
    // TODO: this.kafka = new Kafka({ clientId: this.clientId, brokers: this.brokers });
    //       this.producer = this.kafka.producer(); await this.producer.connect();
    this.logger.info(
      { store: this.name, brokers: this.brokers, clientId: this.clientId },
      'connect() stub',
    );
  }

  async disconnect(): Promise<void> {
    // TODO: await this.producer?.disconnect(); await this.consumer?.disconnect();
    this.producer = null;
    this.consumer = null;
    this.kafka = null;
    this.logger.info({ store: this.name }, 'disconnect() stub');
  }

  async produce(topic: string, message: string, key?: string): Promise<void> {
    // TODO: await this.producer!.send({ topic, messages: [{ key, value: message }] });
    this.logger.debug({ store: this.name, topic, key, message }, 'produce() stub');
  }

  async consume(topic: string, _handler: MessageHandler): Promise<void> {
    // TODO: this.consumer = this.kafka!.consumer({ groupId: this.clientId });
    //       await this.consumer.subscribe({ topic }); await this.consumer.run({ eachMessage: ... });
    this.logger.debug({ store: this.name, topic }, 'consume() stub');
  }
}
