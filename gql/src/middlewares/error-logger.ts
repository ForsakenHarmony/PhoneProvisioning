import { Service } from "typedi";
import { MiddlewareInterface, NextFn, ResolverData, ArgumentValidationError } from "type-graphql";

// import { Context } from "../context";
// import { Logger } from "../logger";

type Context = {};

@Service()
export class ErrorLoggerMiddleware implements MiddlewareInterface<Context> {
  // constructor(private readonly logger: Logger) {}

  async use({ info }: ResolverData<Context>, next: NextFn) {
    try {
      // const start = Date.now();
      const res = await next();
      // const resolveTime = Date.now() - start;
      // if (info.parentType.name === 'Query' || info.parentType.name === 'Mutation') {
      //   console.log(`${info.parentType.name}.${info.fieldName} [${resolveTime} ms] => ${JSON.stringify(res)}`);
      // }
      return res;
    } catch (err) {
      console.warn({
        message: err.message,
        operation: info.operation.operation,
        fieldName: info.fieldName,
        // userName: context.currentUser.name,
      });
      if (!(err instanceof ArgumentValidationError)) {
        // hide errors from db like printing sql query
        throw new Error("Unknown error occurred. Try again later!");
      }
      throw err;
    }
  }
}
