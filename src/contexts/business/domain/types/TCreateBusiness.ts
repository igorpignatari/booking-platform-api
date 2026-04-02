export type TCreateBusiness = {
  userId: string;
  name: string;
  phone: string;
  timezone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    complement?: string;
  };
  category: string;
  email?: string;
  taxId?: string;
};
