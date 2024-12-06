import { rateLimit } from "express-rate-limit";

import RATE_LIMITER_OPTION from "../constants/limiter-constants";

const limiter = rateLimit(RATE_LIMITER_OPTION.api);

export default limiter;
