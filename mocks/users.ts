import { User } from '../types';

const users: (User & { password: string })[] = [
  {
    id: '61eff0b9287b8cab4c76e19f',
    name: 'Admin',
    password: 'password 0',
  },
  {
    id: '61eff0b9287b8cab4c76e1a0',
    name: 'User 1',
    password: 'password 1',
  },
  {
    id: '61eff0b9287b8cab4c76e1a1',
    name: 'User 2',
    password: 'password 2',
  },
  {
    id: '61eff0b9287b8cab4c76e1a2',
    name: 'User 3',
    password: 'password 3',
  },
];
export default users;
