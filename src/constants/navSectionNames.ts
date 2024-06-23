const K8S_RESOURCES = 'K8s Resources';
const WORKLOADS = '';
const CONFIGURATION = '';
const NETWORK = 'Network';
const STORAGE = '';
const ACCESS_CONTROL = 'Access Control';
const CUSTOM = 'Custom Resources';

/** stores the order of subsections for each section */
const representation: Record<string, string[]> = {
  [K8S_RESOURCES]: [WORKLOADS, CONFIGURATION, STORAGE, CUSTOM],
};

export default {
  representation,
  K8S_RESOURCES,
  WORKLOADS,
  CONFIGURATION,
  NETWORK,
  STORAGE,
  ACCESS_CONTROL,
  CUSTOM,
};
