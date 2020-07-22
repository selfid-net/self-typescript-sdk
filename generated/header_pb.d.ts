// package: msgproto
// file: header.proto

import * as jspb from "google-protobuf";
import * as msgtype_pb from "./msgtype_pb";

export class Header extends jspb.Message {
  getType(): msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap];
  setType(value: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap]): void;

  getId(): string;
  setId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Header.AsObject;
  static toObject(includeInstance: boolean, msg: Header): Header.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Header, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Header;
  static deserializeBinaryFromReader(message: Header, reader: jspb.BinaryReader): Header;
}

export namespace Header {
  export type AsObject = {
    type: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap],
    id: string,
  }
}

