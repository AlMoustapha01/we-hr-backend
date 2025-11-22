import { ValueObject } from '@/libs/domain';
import { remove as removeDiacritics } from 'diacritics';
import { transliterate } from 'transliteration';

export class Slug extends ValueObject<string> {
  constructor(props: { value: string }) {
    super({ value: Slug.slugify(props.value) });
  }

  validate(): void {}

  static slugify(text: string): string {
    return removeDiacritics(transliterate(text))
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/-$/g, '');
  }
}
