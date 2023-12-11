import { Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseQueryArrayValuePipe implements PipeTransform<string, string[]> {
  transform(value: string | string[]): string[] {
    if (value) {
      if (Array.isArray(value)) {
        return value;
      }
      const queryArray = JSON.parse(value);
      return [queryArray].flat();
    }
  }
}