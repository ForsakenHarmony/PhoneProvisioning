import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import WritableStream = NodeJS.WritableStream;

// interface WriteFn {
//   (buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean;
//   (str: string, encoding?: string, cb?: (err?: Error | null) => void): boolean;
// }
// type WriteArgs = [Uint8Array | string, ((err?: Error | null) => void)?] | [string, (string | undefined)?, ((err?: Error | null) => void)?];

type WriteFn = WritableStream["write"];
type WriteArgs = Parameters<WriteFn>

function patchWrite(stream: WritableStream, interceptor: WritableStream) {
  const oldWrite = stream.write.bind(stream);

  const newWrite: WriteFn = function write(...args: any[]): boolean {
    return interceptor.write.apply(interceptor, args as WriteArgs) && oldWrite.apply(stream, args as WriteArgs);
  };

  stream.write = newWrite;
}

const cwd = process.cwd();

const logsFolder = join(cwd, "logs");
if (!existsSync(logsFolder)) {
  mkdirSync(logsFolder);
}
const logFileName = `log_${(new Date()).toISOString().replace(/:/g, "-")}.txt`;
const logFileStream = createWriteStream(join(logsFolder, logFileName));

patchWrite(process.stdout, logFileStream);
patchWrite(process.stderr, logFileStream);
