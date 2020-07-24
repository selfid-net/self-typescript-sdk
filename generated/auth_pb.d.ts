// package: msgproto
// file: auth.proto

import * as jspb from "google-protobuf";
import * as msgtype_pb from "./msgtype_pb";

export class Auth extends jspb.Message {
  getType(): msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap];
  setType(value: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap]): void;

  getId(): string;
  setId(value: string): void;

  getToken(): string;
  setToken(value: string): void;

  getDevice(): string;
  setDevice(value: string): void;

  getOffset(): number;
  setOffset(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Auth.AsObject;
  static toObject(includeInstance: boolean, msg: Auth): Auth.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Auth, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Auth;
  static deserializeBinaryFromReader(message: Auth, reader: jspb.BinaryReader): Auth;
}

export namespace Auth {
  export type AsObject = {
    type: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap],
    id: string,
    token: string,
    device: string,
    offset: number,
  }
}

