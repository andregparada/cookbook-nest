import { Chef } from '../../enterprise/entities/chef'
import { Either, left, right } from '@/core/either'
import { ChefAlreadyExistsError } from './errors/chef-already-exists-error'

interface RegisterChefUseCaseRequest {
  firstName: string
  lastName: string
  userName: string
  email: string
  password: string
  bio?: string
  attachmentsIds?: string[]
}

type RegisterChefUseCaseResponse = Either<
  ChefAlreadyExistsError,
  {
    chef: Chef
  }
>

export class RegisterChefUseCase {
  constructor(
    private chefsRepository: ChefsRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterChefUseCaseRequest): Promise<RegisterChefUseCaseResponse> {
    const chefWithSameEmail = await this.chefsRepository.findByEmail(email)

    if (chefWithSameEmail) {
      return left(new ChefAlreadyExistsError(email))
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const chef = Chef.create({
      name,
      email,
      password: hashedPassword,
    })

    await this.chefsRepository.create(chef)

    return right({
      chef,
    })
  }
}
