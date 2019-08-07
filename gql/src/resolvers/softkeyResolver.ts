import { Arg, ID, Mutation, Resolver } from "type-graphql";
import { Softkey } from "../entities/softkey";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { TopSoftkey } from "../entities/top-softkey";
import { moveEntity } from "../helpers";

@Resolver()
export class SoftkeyResolver {
  constructor(
    // @InjectRepository(Company)
    // private readonly companyRepository: Repository<Company>,
    // @InjectRepository(Phone)
    // private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(TopSoftkey)
    private readonly topSoftkeyRepository: Repository<TopSoftkey>,
    @InjectRepository(Softkey)
    private readonly softkeyRepository: Repository<Softkey>
  ) {}

  @Mutation(returns => [Softkey])
  async moveSoftkey(
    @Arg("from", type => ID) from: string,
    @Arg("to", type => ID) to: string
  ): Promise<Softkey[]> {
    return moveEntity(this.softkeyRepository, from, to, "phone", "softkeys");
  }

  @Mutation(returns => [TopSoftkey])
  async moveTopSoftkey(
    @Arg("from", type => ID) from: string,
    @Arg("to", type => ID) to: string
  ): Promise<TopSoftkey[]> {
    return moveEntity(this.topSoftkeyRepository, from, to, "phone", "topSoftkeys");
  }
}
