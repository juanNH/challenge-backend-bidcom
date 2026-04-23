import { EntityBase } from '../../../../shared/domain/entity.base';

export class Brand extends EntityBase {
  constructor(
    id: string,
    public readonly name: string,
    createdAt: Date,
  ) {
    super(id, createdAt);
  }
}
