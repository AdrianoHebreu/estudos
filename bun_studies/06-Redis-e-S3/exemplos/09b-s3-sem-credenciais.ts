// Corre sem nenhuma variável S3_* nem AWS_* definida.
import { s3 } from "bun";
try {
  await s3.file("x/y.txt").text();
} catch (e: any) {
  console.log(e.name, e.code, "|", e.message);
}
