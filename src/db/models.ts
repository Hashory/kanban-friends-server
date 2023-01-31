import { Sequelize, DataTypes, Model } from "sequelize";

// Hand model
export class Hand extends Model {
  declare id: number;
  declare type: Hand_type | string;
  declare value: string;
  declare children_ids: number[];
  declare user_id: string;
}

export enum Hand_type {
  user_board = "user_board",
  board = "board",
  note = "note",
  discord = "discord",
  twitter = "twitter",
}


export function initHandModel(sequelize: Sequelize) {
  Hand.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
      },
      value: {
        type: DataTypes.TEXT,
      },
      children_ids: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      user_id: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: "hands",
    }
  );
}