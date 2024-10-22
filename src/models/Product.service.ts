import { ViewInput } from "./../libs/types/view";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ObjectId } from "mongoose";
import ViewService from "./View.Service";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /** SPA */

  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = { productStatus: ProductStatus.PROCESS };
    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") }; // i is a flag
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 } 
        : { [inquiry.order]: -1 };

    const result = await this.productModel
      .aggregate([
        //one argument type:Array
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit }, // page: skip 0 document => always gives us a page (including 3 docs see next line) // if page is 2 then it skips 1, 2, 3 docs. shows 4, 5, 6
        { $limit: inquiry.limit * 1 }, //  limit: give first 3 docs
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getProduct(
    memberId: ObjectId /*parameter*/ | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // Check Existence
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const existView = await this.viewService.checkViewExistence(input);

      // Insert new View log
      console.log("exist:", !!existView); // if exist works, below does not work => one user one view
      if (!existView) {
        // insert View
        await this.viewService.insertMemberView(input);
      }

      // Increase Counts
      result = await this.productModel
        .findByIdAndUpdate(
          productId,
          { $inc: { productViews: +1 } },
          { new: true }
        )
        .exec();
    }

    return result;
  }

  /* SSR Login */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.log("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id); // string => ObjectId
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    console.log("result:", result);
    return result;
  }
}

export default ProductService;
