/**
 * Fictitious demo identities for Addis Eats (Sample Data)
 * Note: These are for interface state demonstration only, not production security.
 */

export type UserRole = "customer" | "staff";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  defaultAddress: string;
  avatar?: string;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  customer: {
    id: "usr_cust_1",
    name: "Abebe Bikila",
    email: "customer@addiseats.local",
    role: "customer",
    phone: "+251911223344",
    defaultAddress: "Bole Atlas, Cameroon St, House 412, Addis Ababa",
  },
  customerB: {
    id: "usr_cust_2",
    name: "Sara Haile",
    email: "sara@addiseats.local",
    role: "customer",
    phone: "+251922334455",
    defaultAddress: "Kazanchis, Guinea Conakry St, Apt 3B, Addis Ababa",
  },
  staff: {
    id: "usr_staff_1",
    name: "Kitchen Head Chef Dawit",
    email: "kitchen@addiseats.local",
    role: "staff",
    phone: "+251933445566",
    defaultAddress: "Addis Eats Main Kitchen, Bole Medhanealem, Addis Ababa",
  },
};

export const DEFAULT_DEMO_USER: DemoUser = DEMO_USERS.customer;
