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
        const _children = await Hand.findAll({where: {id: { [Op.in]: hand.children}}});

        return {
          id: hand.id,
          type: hand.type,
          value: hand.value,
          children: await Promise.all(_children.map(async (child): Promise<response_hand_type> => {
            return await loadChild({
              id: child.id,
              type: child.type,
              value: child.value,
              children: [...child.children_ids]
            })
          }))
        }
      }

      response = await loadChild({
        id: primaryHand.id,
        type: primaryHand.type,
        value: primaryHand.value,
        children: [...primaryHand.children_ids]
      });

    } else {
      response = {
        id: primaryHand.id,
        type: primaryHand.type,
        value: primaryHand.value,
        children: []
      }
    }

    // response check
    const validationError = res.validateResponse(200, response);
    if (validationError) {
      console.error(validationError);
      throw new Error(validationError); 
    }
  
    res.status(200);
    res.send(response);
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
      value: req.body.value,
      user_id: userid
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
    let updateHand = await Hand.findOne({where: { id: req.body.id, user_id: userid }})
    if(!updateHand) { throw new Error("hand not found"); }

    //value update
    if(req.body.hasOwnProperty("value")) {
      await updateHand?.update({value: req.body.value});
    }

    //parent update
    if(req.body.hasOwnProperty("parentTo") && req.body.hasOwnProperty("parentToPos")) {
      const parentTo = await Hand.findOne({where: { id: req.body.parentTo, user_id: userid }})
      if(!parentTo) { throw new Error("hand not found"); }

      //parentTo update
      const parentToChildren = parentTo.children_ids;
      parentToChildren.splice(req.body.parentToPos, 0, updateHand.id);
      await parentTo.update({children_ids: parentToChildren});
    }

    res.status(200).send("200-更新しました");
  } catch (error) {
    console.error(error);
    res.status(500).send("500-サーバーエラー");
  }
}

export async function deleteHand (req: Request, res: Response): Promise<void> {
  try {
    const token = req.query.userToken?.toString() ? req.query.userToken.toString() : "";
    const userid = await verifyToken(token)

    let deleteHand = await Hand.findOne({where: {id: req.body.id, user_id: userid}});
    if(!deleteHand) { throw new Error("hand not found"); }

    const parent = await Hand.findOne({where: {children_ids: {[Op.contains]: [deleteHand.id]}}});
    if(!parent) { throw new Error("hand not found"); }
    
    const pupdate = parent?.update({children_ids: parent.children_ids.filter((id) => id !== deleteHand?.id)});
    const del = deleteHand?.destroy();

    await Promise.all([del, pupdate])
    res.status(200).send("削除しました");
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
    user_id: userid
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
    value: "ユーザーボード",
    children_ids: [board.id],
    user_id: userid
  });
}