import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api.request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api.response.utils";
import LanguageModel, {
  InsertLanguageDTO,
  SelectLanguageDTO,
} from "./language.model";
import {
  createLanguageService,
  deleteLanguageService,
  findLanguageByColumnService,
  findLanguageByIdService,
  findLanguagesByFiltersService,
  findLanguagesLikeColumnService,
  updateLanguageService,
} from "./language.services";

// *==========*==========*==========POST==========*==========*==========*
export const createLanguage: RequestHandler = async (req, res) => {
  try {
    const languageData: InsertLanguageDTO = req.body;

    const language = await findLanguageByColumnService(languageData.name);

    if (language) {
      return createErrorResponse(res, "Language already exist", 400);
    }

    const newLanguage = await createLanguageService(languageData);

    createSuccessResponse(
      res,
      newLanguage,
      "Language created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getLanguages: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectLanguageDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { languages, totalItems } = await findLanguagesByFiltersService(
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(languages, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getLanguagesLikeColumn: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      name = "",
    } = req.query as unknown as Partial<SelectLanguageDTO> & {
      page?: string;
      limit?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { languages, totalItems } = await findLanguagesLikeColumnService(
      limit,
      offset,
      LanguageModel.name,
      name,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(languages, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getLanguageById: RequestHandler = async (req, res) => {
  try {
    const { languageId } = req.params;

    const language = await findLanguageByIdService(languageId);

    if (!language) {
      return createErrorResponse(res, "Language not found", 404);
    }

    createSuccessResponse(res, language);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateLanguageById: RequestHandler = async (req, res) => {
  try {
    const { languageId } = req.params;
    const languageData: Partial<InsertLanguageDTO> = req.body;

    const existingLanguage = await findLanguageByIdService(languageId);

    if (!existingLanguage) {
      return createErrorResponse(res, "Language not found", 404);
    }

    const updatedLanguage = await updateLanguageService(
      languageId,
      languageData,
    );

    createSuccessResponse(res, updatedLanguage);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteLanguageById: RequestHandler = async (req, res) => {
  try {
    const { languageId } = req.params;
    const deletedLanguage = await deleteLanguageService(languageId);

    if (!deletedLanguage) {
      return createErrorResponse(
        res,
        "Something cause language not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted language with id ${deletedLanguage.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
