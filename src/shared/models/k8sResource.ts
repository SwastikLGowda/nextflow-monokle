import * as Rt from 'runtypes';

import {ResourceRef} from '@monokle/validation';

import {K8sObject, K8sObjectRuntype} from './k8s';
import {
  AnyOrigin,
  AnyOriginRuntype,
  ClusterOrigin,
  ClusterOriginRuntype,
  LocalOrigin,
  LocalOriginRuntype,
  PreviewOrigin,
  PreviewOriginRuntype,
  UnsavedOrigin,
  UnsavedOriginRuntype,
} from './origin';

export type ResourceIdentifier<Origin extends AnyOrigin = AnyOrigin> = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  origin: Origin;
};

const ResourceIdentifierRuntype: Rt.Runtype<ResourceIdentifier<AnyOrigin>> = Rt.Record({
  id: Rt.String,
  origin: AnyOriginRuntype,
});

export const isResourceIdentifier = ResourceIdentifierRuntype.guard;

export interface ResourceMeta<Origin extends AnyOrigin = AnyOrigin> extends ResourceIdentifier<Origin> {
  /**
   * name - generated from manifest metadata
   */
  name: string;
  /** k8s resource kind */
  kind: string;
  /** k8s resource apiVersion value */
  apiVersion: string;
  /** k8s namespace is specified (for filtering) */
  namespace?: string;
  /** spec.metadata.labels */
  labels: Record<string, string>;
  /** spec.metadata.labels.annotations  */
  annotations: Record<string, string>;
  /** spec.template.metadata.labels */
  templateLabels?: Record<string, string>;
  /** if a resource is cluster scoped ( kind is namespaced ) */
  isClusterScoped: boolean;
  /** specifies the range in the file's content, applies only to file locations  */
  range?: {
    start: number;
    length: number;
  };
  refs?: ResourceRef[];
}

const ResourceMetaRuntype: Rt.Runtype<ResourceMeta<AnyOrigin>> = Rt.Record({
  id: Rt.String,
  origin: AnyOriginRuntype,
  name: Rt.String,
  kind: Rt.String,
  apiVersion: Rt.String,
  namespace: Rt.Optional(Rt.String),
  labels: Rt.Dictionary(Rt.String),
  annotations: Rt.Dictionary(Rt.String),
  templateLabels: Rt.Optional(Rt.Dictionary(Rt.String)),
  isClusterScoped: Rt.Boolean,
  range: Rt.Optional(
    Rt.Record({
      start: Rt.Number,
      length: Rt.Number,
    })
  ),
  isUnsaved: Rt.Optional(Rt.Boolean),
});

const LocalResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: LocalOriginRuntype}));
const ClusterResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: ClusterOriginRuntype}));
const PreviewResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: PreviewOriginRuntype}));
const UnsavedResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: UnsavedOriginRuntype}));

export const isLocalResourceMeta = LocalResourceMetaRuntype.guard;
export const isClusterResourceMeta = ClusterResourceMetaRuntype.guard;
export const isPreviewResourceMeta = PreviewResourceMetaRuntype.guard;
export const isUnsavedResourceMeta = UnsavedResourceMetaRuntype.guard;

export interface ResourceContent<Origin extends AnyOrigin = AnyOrigin> extends ResourceIdentifier<Origin> {
  text: string;
  object: K8sObject;
}

const ResourceContentRuntype: Rt.Runtype<ResourceContent<AnyOrigin>> = Rt.Record({
  id: Rt.String,
  origin: AnyOriginRuntype,
  text: Rt.String,
  object: K8sObjectRuntype,
});

const LocalResourceContentRuntype: Rt.Runtype<ResourceContent<LocalOrigin>> = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({origin: LocalOriginRuntype})
);
const ClusterResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: ClusterOriginRuntype}));
const PreviewResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: PreviewOriginRuntype}));
const UnsavedResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: UnsavedOriginRuntype}));

export const isLocalResourceContent = LocalResourceContentRuntype.guard;
export const isClusterResourceContent = ClusterResourceContentRuntype.guard;
export const isPreviewResourceContent = PreviewResourceContentRuntype.guard;
export const isUnsavedResourceContent = UnsavedResourceContentRuntype.guard;

export type K8sResource<Origin extends AnyOrigin = AnyOrigin> = ResourceMeta<Origin> & ResourceContent<Origin>;

const ResourceRuntype: Rt.Runtype<K8sResource> = Rt.Intersect(ResourceMetaRuntype, ResourceContentRuntype);
const LocalResourceRuntype: Rt.Runtype<K8sResource<LocalOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: LocalOriginRuntype})
);
const ClusterResourceRuntype: Rt.Runtype<K8sResource<ClusterOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: ClusterOriginRuntype})
);
const PreviewResourceRuntype: Rt.Runtype<K8sResource<PreviewOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: PreviewOriginRuntype})
);
const UnsavedResourceRuntype: Rt.Runtype<K8sResource<UnsavedOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: UnsavedOriginRuntype})
);

export const isResource = ResourceRuntype.guard;
export const isLocalResource = LocalResourceRuntype.guard;
export const isClusterResource = ClusterResourceRuntype.guard;
export const isPreviewResource = PreviewResourceRuntype.guard;
export const isUnsavedResource = UnsavedResourceRuntype.guard;

export type ResourceMetaMap<Origin extends AnyOrigin = AnyOrigin> = Record<string, ResourceMeta<Origin>>;

export type ResourceContentMap<Origin extends AnyOrigin = AnyOrigin> = Record<string, ResourceContent<Origin>>;

export type ResourceMap<Origin extends AnyOrigin = AnyOrigin> = Record<string, K8sResource<Origin>>;

export type ResourceMetaStorage = {
  local: ResourceMetaMap<LocalOrigin>;
  cluster: ResourceMetaMap<ClusterOrigin>;
  preview: ResourceMetaMap<PreviewOrigin>;
  unsaved: ResourceMetaMap<UnsavedOrigin>;
};

export type ResourceContentStorage = {
  local: ResourceContentMap<LocalOrigin>;
  cluster: ResourceContentMap<ClusterOrigin>;
  preview: ResourceContentMap<PreviewOrigin>;
  unsaved: ResourceContentMap<UnsavedOrigin>;
};

export type ResourceStorageKey = keyof ResourceMetaStorage | keyof ResourceContentStorage;
