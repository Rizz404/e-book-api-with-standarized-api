import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import AuthorModel, { InsertAuthorDTO, SelectAuthorDTO } from "./author.model";
import {
  createAuthorService,
  deleteAuthorService,
  findAuthorByColumnService,
  findAuthorByIdService,
  findAuthorsByFiltersService,
  findAuthorsLikeColumnService,
  updateAuthorService,
} from "./author.services";

// *==========*==========*==========POST==========*==========*==========*
export const createAuthor: RequestHandler = async (req, res) => {
  try {
    const authorData: Pick<
      InsertAuthorDTO,
      "name" | "biography" | "profilePicture" | "birthDate" | "deathDate"
    > = req.body;

    const author = await findAuthorByColumnService(authorData.name);

    if (author) {
      return createErrorResponse(res, "Author already exist", 400);
    }

    const newAuthor = await createAuthorService(authorData);

    createSuccessResponse(res, newAuthor, "Author created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getAuthors: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectAuthorDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { authors, totalItems } = await findAuthorsByFiltersService(
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(authors, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getAuthorsLikeColumn: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      name = "",
    } = req.query as unknown as Partial<SelectAuthorDTO> & {
      page?: string;
      limit?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { authors, totalItems } = await findAuthorsLikeColumnService(
      limit,
      offset,
      AuthorModel.name,
      name,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(authors, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getAuthorById: RequestHandler = async (req, res) => {
  try {
    const { authorId } = req.params;

    const author = await findAuthorByIdService(authorId);

    if (!author) {
      return createErrorResponse(res, "Author not found", 404);
    }

    createSuccessResponse(res, author);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateAuthorById: RequestHandler = async (req, res) => {
  try {
    const { authorId } = req.params;
    const authorData: Partial<InsertAuthorDTO> = req.body;

    const existingAuthor = await findAuthorByIdService(authorId);

    if (!existingAuthor) {
      return createErrorResponse(res, "Author not found", 404);
    }

    const updatedAuthor = await updateAuthorService(authorId, authorData);

    createSuccessResponse(res, updatedAuthor);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteAuthorById: RequestHandler = async (req, res) => {
  try {
    const { authorId } = req.params;
    const deletedAuthor = await deleteAuthorService(authorId);

    if (!deletedAuthor) {
      return createErrorResponse(
        res,
        "Something cause author not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted author with id ${deletedAuthor.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
