// package: msgproto
// file: notification.proto

import * as jspb from "google-protobuf";
import * as msgtype_pb from "./msgtype_pb";
import * as errtype_pb from "./errtype_pb";

export class Notification extends jspb.Message {
  getType(): msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap];
  setType(value: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap]): void;

  getId(): string;
  setId(value: string): void;

  getError(): string;
  setError(value: string): void;

  getErrtype(): errtype_pb.ErrTypeMap[keyof errtype_pb.ErrTypeMap];
  setErrtype(value: errtype_pb.ErrTypeMap[keyof errtype_pb.ErrTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Notification.AsObject;
  static toObject(includeInstance: boolean, msg: Notification): Notification.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Notification, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Notification;
  static deserializeBinaryFromReader(message: Notification, reader: jspb.BinaryReader): Notification;
}

export namespace Notification {
  export type AsObject = {
    type: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap],
    id: string,
    error: string,
    errtype: errtype_pb.ErrTypeMap[keyof errtype_pb.ErrTypeMap],
  }
}

