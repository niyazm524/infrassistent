export interface DockerContainerData {
  id: string;
  name: string;
  image: string;
  imageID: string;
  command: string;
  created: number;
  started: number;
  finished: number;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  state: string;
  restartCount: number;
  platform: string;
  driver: string;
  ports: {
    PrivatePort: number;
    Type: string;
    PublicPort?: number;
    IP?: string;
  }[];
  mounts: DockerContainerMountData[];
}

export interface DockerContainerMountData {
  Type: string;
  Source: string;
  Destination: string;
  Mode: string;
  RW: boolean;
  Propagation: string;
}

export interface OsData {
  platform: string;
  distro: string;
  release: string;
  codename: string;
  kernel: string;
  arch: string;
  hostname: string;
  fqdn: string;
  codepage: string;
  logofile: string;
  serial: string;
  build: string;
  servicepack: string;
  uefi: boolean;
  hypervizor?: boolean;
  remoteSession?: boolean;
  hypervisor?: boolean;
}

export interface TimeData {
  current: string;
  uptime: string;
  timezone: string;
  timezoneName: string;
}
