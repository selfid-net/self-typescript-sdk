// package: msgproto
// file: message.proto

import * as jspb from "google-protobuf";
import * as msgtype_pb from "./msgtype_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class Message extends jspb.Message {
  getType(): msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap];
  setType(value: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap]): void;

  getId(): string;
  setId(value: string): void;

  getSender(): string;
  setSender(value: string): void;

  getRecipient(): string;
  setRecipient(value: string): void;

  getCiphertext(): Uint8Array | string;
  getCiphertext_asU8(): Uint8Array;
  getCiphertext_asB64(): string;
  setCiphertext(value: Uint8Array | string): void;

  hasTimestamp(): boolean;
  clearTimestamp(): void;
  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): void;

  getOffset(): number;
  setOffset(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
  export type AsObject = {
    type: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap],
    id: string,
    sender: string,
    recipient: string,
    ciphertext: Uint8Array | string,
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    offset: number,
  }
}

