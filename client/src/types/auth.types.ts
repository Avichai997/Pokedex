export interface IUser {
  id: string;
  email: string;
}

export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRegisterDto {
  email: string;
  password: string;
}
