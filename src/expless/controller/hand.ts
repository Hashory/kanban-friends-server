import { query, Request, response, Response } from "express";
import { Op } from "sequelize";
import { Hand, Hand_type } from "../../db/models";
import verifyToken from "../util/verifyToken";

interface response_hand_type {
  id: number;
  type: Hand_type | string;
  value: string;
  children?: response_hand_type[];
}

// hands
export async function getHand (req: Request, res: Response & { validateResponse: any }): Promise<void> {
  try {
    const token = req.query.userToken?.toString() ? req.query.userToken.toString() : "";
    const userid = await verifyToken(token)

    const handId = req.query.handId ? req.query.handId : "user_board";
    const isChildren =  req.query.isChildren ? req.query.isChildren : true;

    let response: response_hand_type;
    let primaryHand: Hand | null;

    //new user craete
    if((await Hand.count({where: {user_id: userid}})) == 0) {
      await newUserCreate(userid);
    }

    if(handId == "user_board") {
      primaryHand = await Hand.findOne({where: {user_id: userid, type: "user_board"}});
    } else {
      primaryHand = await Hand.findOne({where: {id: handId}});
    }

    if(!primaryHand) { throw new Error("hand not found"); }

    // childload
    if(isChildren && primaryHand.children_ids) {
      const loadChild = async (hand: { id: number; type: string; value: string; children: number[]; }): Promise<response_hand_type> => {
        let _hand: response_hand_type = {
          id: hand.id,
          type: hand.type,
          value: hand.value,
          children: [],
        };

        const children = await Hand.findAll({
          where: {
            id: {
              [Op.in]: hand.children
            }
          }
        });
        _hand.children = await Promise.all(children.map(async (child): Promise<response_hand_type> => {
          let _child: response_hand_type = {
            id: child.id,
            type: child.type,
            value: child.value,
            children: [],
          }

          const __children = await loadChild({
            id: child.id,
            type: child.type,
            value: child.value,
            children: child.children_ids
          });

          _child.children = [{...__children}];
          return _child;
        }));

        return _hand;
      }

      response = await loadChild({
        id: primaryHand.id,
        type: primaryHand.type,
        value: primaryHand.value,
        children: primaryHand.children_ids
      });
    } else {
      console.log(primaryHand.id);
      response = {
        id: primaryHand.id,
        type: primaryHand.type,
        value: primaryHand.value,
      }
    }

    // response check
    const validationError = res.validateResponse(200, response);
    if (validationError) {
      throw new Error(validationError); 
    }

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("500-サーバーエラー");
  }
}

export async function createHand (req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.userToken?.toString() ? req.query.userToken.toString() : "";
    const userid = await verifyToken(token)

    // create hand
    const createHand = await Hand.create({
      type: req.body.type,
      value: req.body.value
    });
    // add parent relation
    Hand.findOne({where: { id: req.body.parent }}).then((parent) => {
      parent?.update({children_ids: [...parent.children_ids, createHand.children_ids]}).then(() => {
        res.status(200).send("200-作成しました");
      })
    })
  } catch (error) {
    console.error(error);
    res.status(500).send("500-サーバーエラー");
  }
}

export async function updateHand (req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.userToken?.toString() ? req.query.userToken.toString() : "";
    const userid = await verifyToken(token)
  // update Hand
  Hand.findOne({where: { id: req.body.id }}).then((updateHand) => {
    let updateProp: any = {};

    //value update
    if(req.body.hasOwnProperty("value")) {
      updateProp.value = req.body.value;
    }

    //parent update
    if(req.body.hasOwnProperty("parentTo") && req.body.hasOwnProperty("parentToPos")) {
      updateProp.parentTo = req.body.parentTo;
      updateProp.parentToPos = req.body.parentToPos;
    }

    //update Hand
    updateHand?.update(updateProp).then(() => {
      res.status(200).send("200-更新しました");
    });
  })

  } catch (error) {
    console.error(error);
    res.status(500).send("500-サーバーエラー");
  }
}

export async function deleteHand (req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.userToken?.toString() ? req.query.userToken.toString() : "";
    const userid = await verifyToken(token)

    Hand.findOne({where: {id: req.body.id}}).then((deleteHand) => {
      const del = deleteHand?.destroy();
      const parent = new Promise(() => {}); //TODO delete parent's children slot.
      Promise.all([del, parent]).then(() => {
        res.status(200).send("削除しました");
      })
    })
  } catch (error) {
    console.error(error);
    res.status(500).send("500-サーバーエラー");
  }
}


async function newUserCreate (userid: string): Promise<void> {
  console.log("新しいユーザー用のデータを作成します");
  //create note hand
  const noteHand = await Hand.create({
    type: "note",
    value: "簡単に使い方について説明します",
    children_ids: [],
    userid: userid
  });

  // create board
  const board = await Hand.create({
    type: "board",
    value: "ボード",
    children_ids: [noteHand.id],
    user_id: userid
  });

  // create user board
  const userBoard = await Hand.create({
    type: "user_board",
    value: "はじめまして",
    children_ids: [board.id],
    user_id: userid
  });

}