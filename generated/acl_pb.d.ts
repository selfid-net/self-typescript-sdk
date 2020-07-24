// package: msgproto
// file: acl.proto

import * as jspb from "google-protobuf";
import * as msgtype_pb from "./msgtype_pb";
import * as aclcommand_pb from "./aclcommand_pb";

export class AccessControlList extends jspb.Message {
  getType(): msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap];
  setType(value: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap]): void;

  getId(): string;
  setId(value: string): void;

  getCommand(): aclcommand_pb.ACLCommandMap[keyof aclcommand_pb.ACLCommandMap];
  setCommand(value: aclcommand_pb.ACLCommandMap[keyof aclcommand_pb.ACLCommandMap]): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccessControlList.AsObject;
  static toObject(includeInstance: boolean, msg: AccessControlList): AccessControlList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccessControlList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccessControlList;
  static deserializeBinaryFromReader(message: AccessControlList, reader: jspb.BinaryReader): AccessControlList;
}

export namespace AccessControlList {
  export type AsObject = {
    type: msgtype_pb.MsgTypeMap[keyof msgtype_pb.MsgTypeMap],
    id: string,
    command: aclcommand_pb.ACLCommandMap[keyof aclcommand_pb.ACLCommandMap],
    payload: Uint8Array | string,
  }
}

