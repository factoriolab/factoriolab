/**
 * This script updates the Satisfactory (sfy) mod set.
 * It reads localization files containing recipes and unlocks,
 * and fills the data into the src/sfy/data.json file.
 */

import { log } from 'console';
import fs from 'fs';
import { StringifyOptions } from 'querystring';
import { find } from 'rxjs';
import { pipeline } from 'stream';

import { EnergyType, ItemJson, ModData, ModHash, RecipeJson } from '~/models';
import { StreamTriggerDelivery } from './factorio.models';
import { emptyModHash, logTime, logWarn } from './helpers';

type SfyData =
  | SfyRecipeData
  | SfyResearchData
  | SfyDescData
  | SfyConveyorBeltData
  | SfyPipelineData
  | SfyResourceExtractorData
  | SfyManufacturerData;

interface SfyRecipeData {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'";
  Classes: SfyRecipe[];
}
interface SfyResearchData {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic'";
  Classes: SfyResearch[];
}
interface SfyDescData {
  NativeClass:
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'"
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGVehicleDescriptor'"
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGResourceDescriptor'";
  Classes: SfyDesc[];
}
interface SfyConveyorBeltData {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableConveyorBelt'";
  Classes: SfyConveyorBelt[];
}
interface SfyPipelineData {
  NativeClass: "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildablePipeline'";
  Classes: SfyPipeline[];
}
interface SfyResourceExtractorData {
  NativeClass:
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableResourceExtractor'"
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableWaterPump'"
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableFrackingExtractor'";
  Classes: SfyResourceExtractor[];
}
interface SfyManufacturerData {
  NativeClass:
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableManufacturer'"
    | "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableManufacturerVariablePower'";
  Classes: SfyManufacturer[];
}

interface SfyRecipe {
  ClassName: string;
  FullName: string;
  mDisplayName: string;
  mIngredients: SfyIngredient[] | '';
  mProduct: SfyIngredient[];
  mManufacturingMenuPriority: string;
  mManufactoringDuration: string;
  mManualManufacturingMultiplier: string;
  mProducedIn: string[] | string;
  mRelevantEvents: string;
  mVariablePowerConsumptionConstant: string;
  mVariablePowerConsumptionFactor: string;
}

interface SfyResearch {
  ClassName: string;
  FullName: string;
  mType: string;
  mDisplayName: string;
  mDescription: string;
  mStatisticGameplayTag: string;
  mSubCategories: string;
  mMenuPriority: string;
  mTechTier: string;
  mCost: { ItemClass: string; Amount: number }[] | '';
  mTimeToComplete: string;
  mRelevantShopSchematics: string;
  mIsPlayerSpecific: string;
  mUnlocks: SfyUnlock[];
  mSchematicIcon: string;
  mSmallSchematicIcon: string;
  mSchematicDependencies: {
    Class: string;
    mSchematics: string[];
    mRequireAllSchematicsToBePurchased: 'True' | 'False';
  }[];
  mDependenciesBlocksSchematicAccess: string;
  mHiddenUntilDependenciesMet: string;
  mRelevantEvents: string;
  mSchematicUnlockTag: string;
  mIncludeInBuilds: string;
}

interface RGBA {
  R: number;
  G: number;
  B: number;
  A: number;
}
interface SfyDesc {
  ClassName: string;
  // only on resources
  mManualMiningAudioName?: string;
  mDisplayName: string;
  mDescription: string;
  mAbbreviatedDisplayName: string;
  mStackSize: string;
  // only on vehicles
  mInventorySize?: string;
  mCanBeDiscarded: string;
  mRememberPickUp: string;
  mEnergyValue: string;
  mRadioactiveDecay: string;
  mForm: string;
  mGasType: string;
  mSmallIcon: string;
  mPersistentBigIcon: string;
  mCrosshairMaterial: string;
  mDescriptorStatBars: string;
  mIsAlienItem: string;
  mSubCategories: string;
  mMenuPriority: string;
  mFluidColor: RGBA;
  mGasColor: RGBA;
  mCompatibleItemDescriptors: string;
  mClassToScanFor: string;
  mScannableType: string;
  mShouldOverrideScannerDisplayText: string;
  mScannerDisplayText: string;
  mScannerLightColor: RGBA;
  mNeedsPickUpMarker: string;
  mResourceSinkPoints: string;
}

interface SfyConveyorBelt {
  ClassName: string;
  mCustomSkins: string;
  mMeshLength: string;
  mItemMeshMap: string;
  mSplineData: string;
  mSpeed: string;
  mItems: string;
  mConveyorChainFlags: string;
  mChainSegmentIndex: string;
  mDisplayName: string;
  mDescription: string;
  MaxRenderDistance: string;
  mAlternativeMaterialRecipes: string;
  mContainsComponents: string;
  mIsConsideredForBaseWeightValue: string;
  bForceLegacyBuildEffect: string;
  bForceBuildEffectSolo: string;
  mBuildEffectSpeed: string;
  mAllowColoring: string;
  mAllowPatterning: string;
  mInteractionRegisterPlayerWithCircuit: string;
  mSkipBuildEffect: string;
  mForceNetUpdateOnRegisterPlayer: string;
  mToggleDormancyOnInteraction: string;
  mIsMultiSpawnedBuildable: string;
  mShouldShowAttachmentPointVisuals: string;
  mCanContainLightweightInstances: string;
  mManagedByLightweightBuildableSubsystem: string;
  mRemoveBuildableFromSubsystemOnDismantle: string;
  mHasBeenRemovedFromSubsystem: string;
  mAffectsOcclusion: string;
  mOcclusionShape: string;
  mScaleCustomOffset: string;
  mCustomScaleType: string;
  mOcclusionBoxInfo: string;
  mAttachmentPoints: string;
  mReplicatedBuiltInsideBlueprintDesigner: string;
  mInteractingPlayers: string;
  mIsUseable: string;
  mClearanceData: string;
  mHideOnBuildEffectStart: string;
  mShouldModifyWorldGrid: string;
  mTimelapseBucketId: string;
  mTimelapseDelay: string;
  mAlienOverClockingZOffset: string;
  mAlienOverClockingAttenuationScalingFactor: string;
  mAlienOverClockingVolumeDB_RTPC: string;
  mAlienOverClockingHighpass_RTPC: string;
  mAlienOverClockingPitch_RTPC: string;
  mBlueprintBuildEffectID: string;
}
interface SfyPipeline {
  ClassName: string;
  mRadius: string;
  mFlowLimit: string;
  mFlowIndicatorMinimumPipeLength: string;
  mSoundSplineComponentEmitterInterval: string;
  mPipeConnections: string;
  mFluidBox: string;
  mIndicatorData: string;
  mMaxIndicatorTurnAngle: string;
  mIgnoreActorsForIndicator: string;
  mFluidNames: string;
  mCurrentFluid: string;
  mLastContentForSound: string;
  mLastFlowForSound: string;
  mLastElapsedTime: string;
  mLastFlowForSoundUpdateThreshold: string;
  mRattleLimit: string;
  mIsRattling: string;
  mUpdateSoundsHandle: string;
  mUpdateSoundsTimerInterval: string;
  mMeshLength: string;
  mSplineData: string;
  mSnappedPassthroughs: string;
  mDisplayName: string;
  mDescription: string;
  MaxRenderDistance: string;
  mAlternativeMaterialRecipes: string;
  mContainsComponents: string;
  mIsConsideredForBaseWeightValue: string;
  bForceLegacyBuildEffect: string;
  bForceBuildEffectSolo: string;
  mBuildEffectSpeed: string;
  mAllowColoring: string;
  mAllowPatterning: string;
  mInteractionRegisterPlayerWithCircuit: string;
  mSkipBuildEffect: string;
  mForceNetUpdateOnRegisterPlayer: string;
  mToggleDormancyOnInteraction: string;
  mIsMultiSpawnedBuildable: string;
  mShouldShowAttachmentPointVisuals: string;
  mCanContainLightweightInstances: string;
  mManagedByLightweightBuildableSubsystem: string;
  mRemoveBuildableFromSubsystemOnDismantle: string;
  mHasBeenRemovedFromSubsystem: string;
  mAffectsOcclusion: string;
  mOcclusionShape: string;
  mScaleCustomOffset: string;
  mCustomScaleType: string;
  mOcclusionBoxInfo: string;
  mAttachmentPoints: string;
  mReplicatedBuiltInsideBlueprintDesigner: string;
  mInteractingPlayers: string;
  mIsUseable: string;
  mClearanceData: string;
  mHideOnBuildEffectStart: string;
  mShouldModifyWorldGrid: string;
  mTimelapseBucketId: string;
  mTimelapseDelay: string;
  mAlienOverClockingZOffset: string;
  mAlienOverClockingAttenuationScalingFactor: string;
  mAlienOverClockingVolumeDB_RTPC: string;
  mAlienOverClockingHighpass_RTPC: string;
  mAlienOverClockingPitch_RTPC: string;
  mBlueprintBuildEffectID: string;
}

interface SfyResourceExtractor {
  ClassName: string;
  mParticleMap: string;
  mCanPlayAfterStartUpStopped: string;
  SAMReference: string;
  mExtractStartupTime: string;
  mExtractStartupTimer: string;
  mExtractCycleTime: string;
  mItemsPerCycle: string;
  mPipeOutputConnections: string;
  mAllowedResourceForms: string;
  mOnlyAllowCertainResources: string;
  mAllowedResources: string;
  mExtractorTypeName: string;
  mTryFindMissingResource: string;
  mPowerConsumption: string;
  mPowerConsumptionExponent: string;
  mProductionBoostPowerConsumptionExponent: string;
  mDoesHaveShutdownAnimation: string;
  mOnHasPowerChanged: string;
  mOnHasProductionChanged: string;
  mOnHasStandbyChanged: string;
  mOnPendingPotentialChanged: string;
  mOnPendingProductionBoostChanged: string;
  mOnCurrentProductivityChanged: string;
  mMinimumProducingTime: string;
  mMinimumStoppedTime: string;
  mCanEverMonitorProductivity: string;
  mCanChangePotential: string;
  mCanChangeProductionBoost: string;
  mMinPotential: string;
  mMaxPotential: string;
  mBaseProductionBoost: string;
  mPotentialShardSlots: string;
  // Somersloops
  mProductionShardSlotSize: string;
  mProductionShardBoostMultiplier: string;
  mFluidStackSizeDefault: string;
  mFluidStackSizeMultiplier: string;
  mHasInventoryPotential: string;
  mIsTickRateManaged: string;
  mEffectUpdateInterval: string;
  mDefaultProductivityMeasurementDuration: string;
  mLastProductivityMeasurementProduceDuration: string;
  mLastProductivityMeasurementDuration: string;
  mCurrentProductivityMeasurementProduceDuration: string;
  mCurrentProductivityMeasurementDuration: string;
  mProductivityMonitorEnabled: string;
  mOverridePotentialShardSlots: string;
  mOverrideProductionShardSlotSize: string;
  mAddToSignificanceManager: string;
  mAlienOverClockingParticleEffects: string;
  mCachedSkeletalMeshes: string;
  mSignificanceRange: string;
  mTickExponent: string;
  mDisplayName: string;
  mDescription: string;
  MaxRenderDistance: string;
  mAlternativeMaterialRecipes: string;
  mContainsComponents: string;
  mIsConsideredForBaseWeightValue: string;
  bForceLegacyBuildEffect: string;
  bForceBuildEffectSolo: string;
  mBuildEffectSpeed: string;
  mAllowColoring: string;
  mAllowPatterning: string;
  mInteractionRegisterPlayerWithCircuit: string;
  mSkipBuildEffect: string;
  mForceNetUpdateOnRegisterPlayer: string;
  mToggleDormancyOnInteraction: string;
  mIsMultiSpawnedBuildable: string;
  mShouldShowAttachmentPointVisuals: string;
  mCanContainLightweightInstances: string;
  mManagedByLightweightBuildableSubsystem: string;
  mRemoveBuildableFromSubsystemOnDismantle: string;
  mHasBeenRemovedFromSubsystem: string;
  mAffectsOcclusion: string;
  mOcclusionShape: string;
  mScaleCustomOffset: string;
  mCustomScaleType: string;
  mOcclusionBoxInfo: string;
  mAttachmentPoints: string;
  mReplicatedBuiltInsideBlueprintDesigner: string;
  mInteractingPlayers: string;
  mIsUseable: string;
  mClearanceData: string;
  mHideOnBuildEffectStart: string;
  mShouldModifyWorldGrid: string;
  mTimelapseBucketId: string;
  mTimelapseDelay: string;
  mAlienOverClockingZOffset: string;
  mAlienOverClockingAttenuationScalingFactor: string;
  mAlienOverClockingVolumeDB_RTPC: string;
  mAlienOverClockingHighpass_RTPC: string;
  mAlienOverClockingPitch_RTPC: string;
  mBlueprintBuildEffectID: string;
}

interface SfyManufacturer {
  ClassName: string;
  IsPowered: string;
  mProductionEffectsRunning: string;
  mCurrentRecipeChanged: string;
  mManufacturingSpeed: string;
  mFactoryInputConnections: string;
  mPipeInputConnections: string;
  mFactoryOutputConnections: string;
  mPipeOutputConnections: string;
  mPowerConsumption: string;
  mPowerConsumptionExponent: string;
  mProductionBoostPowerConsumptionExponent: string;
  mDoesHaveShutdownAnimation: string;
  mOnHasPowerChanged: string;
  mOnHasProductionChanged: string;
  mOnHasStandbyChanged: string;
  mOnPendingPotentialChanged: string;
  mOnPendingProductionBoostChanged: string;
  mOnCurrentProductivityChanged: string;
  mMinimumProducingTime: string;
  mMinimumStoppedTime: string;
  mCanEverMonitorProductivity: string;
  mCanChangePotential: string;
  mCanChangeProductionBoost: string;
  mMinPotential: string;
  mMaxPotential: string;
  mBaseProductionBoost: string;
  mPotentialShardSlots: string;
  // Somersloops
  mProductionShardSlotSize: string;
  mProductionShardBoostMultiplier: string;
  mFluidStackSizeDefault: string;
  mFluidStackSizeMultiplier: string;
  mHasInventoryPotential: string;
  mIsTickRateManaged: string;
  mEffectUpdateInterval: string;
  mDefaultProductivityMeasurementDuration: string;
  mLastProductivityMeasurementProduceDuration: string;
  mLastProductivityMeasurementDuration: string;
  mCurrentProductivityMeasurementProduceDuration: string;
  mCurrentProductivityMeasurementDuration: string;
  mProductivityMonitorEnabled: string;
  mOverridePotentialShardSlots: string;
  mOverrideProductionShardSlotSize: string;
  mAddToSignificanceManager: string;
  mAlienOverClockingParticleEffects: string;
  mCachedSkeletalMeshes: string;
  mSignificanceRange: string;
  mTickExponent: string;
  mDisplayName: string;
  mDescription: string;
  MaxRenderDistance: string;
  mAlternativeMaterialRecipes: string;
  mContainsComponents: string;
  mIsConsideredForBaseWeightValue: string;
  bForceLegacyBuildEffect: string;
  bForceBuildEffectSolo: string;
  mBuildEffectSpeed: string;
  mAllowColoring: string;
  mAllowPatterning: string;
  mInteractionRegisterPlayerWithCircuit: string;
  mSkipBuildEffect: string;
  mForceNetUpdateOnRegisterPlayer: string;
  mToggleDormancyOnInteraction: string;
  mIsMultiSpawnedBuildable: string;
  mShouldShowAttachmentPointVisuals: string;
  mCanContainLightweightInstances: string;
  mManagedByLightweightBuildableSubsystem: string;
  mRemoveBuildableFromSubsystemOnDismantle: string;
  mHasBeenRemovedFromSubsystem: string;
  mAffectsOcclusion: string;
  mOcclusionShape: string;
  mScaleCustomOffset: string;
  mCustomScaleType: string;
  mOcclusionBoxInfo: string;
  mAttachmentPoints: string;
  mReplicatedBuiltInsideBlueprintDesigner: string;
  mInteractingPlayers: string;
  mIsUseable: string;
  mClearanceData: string;
  mHideOnBuildEffectStart: string;
  mShouldModifyWorldGrid: string;
  mTimelapseBucketId: string;
  mTimelapseDelay: string;
  mAlienOverClockingZOffset: string;
  mAlienOverClockingAttenuationScalingFactor: string;
  mAlienOverClockingVolumeDB_RTPC: string;
  mAlienOverClockingHighpass_RTPC: string;
  mAlienOverClockingPitch_RTPC: string;
  mBlueprintBuildEffectID: string;
}

interface SfyUnlock {
  Class: string;
  mRecipes: string[];
  mSchematics: string[];
}

interface SfyIngredient {
  ItemClass: string;
  Amount: number;
}

const deniedRecipes = [
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Recipes/Buildings",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Buildable/",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Prototype/Buildable/",
  "/Script/Engine.BlueprintGeneratedClass'/Game/FactoryGame/Recipes/Vehicle/",
];

const deniedProducers = [
  'FGBuildableAutomatedWorkBench',
  'BP_WorkBenchComponent_C',
  'BP_WorkshopComponent_C',
  'FGBuildGun',
];

/** Utility Functions */

function parseKeyValuePairs(str: string): Record<string, any> {
  const obj: any = {};
  const regex = /(\w+)=("([^"]*)"|'([^']*)'|[^,()]+)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const key = match[1];
    const value = match[3] || match[4] || match[2] || match[5];
    let cleanValue = value.trim();
    if (
      (cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
      (cleanValue.startsWith("'") && cleanValue.endsWith("'"))
    ) {
      cleanValue = cleanValue.substring(1, cleanValue.length - 1);
    }
    if (!isNaN(Number(cleanValue)) && cleanValue !== '') {
      obj[key] = Number(cleanValue);
    } else {
      obj[key] = cleanValue;
    }
  }
  return obj;
}

function parseStringTuple(str: string): string[] | string {
  try {
    str = str.trim();
    if (str.startsWith('(') && str.endsWith(')')) {
      str = str.substring(1, str.length - 1);
    } else {
      throw new Error();
    }
    const regex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^,]+/g;
    const result = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      let value = match[0].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.substring(1, value.length - 1);
      }
      value = value.replace(/\\"/g, '"').replace(/\\'/g, "'");
      result.push(value);
    }
    return result;
  } catch (error) {
    console.error('Error parsing string tuple:', str, 'error:', error);
    return str;
  }
}

function parseTupleArray(str: string): any[] | string {
  try {
    str = str.trim();
    if (str.startsWith('((') && str.endsWith('))')) {
      str = str.substring(2, str.length - 2);
    } else if (str.startsWith('(') && str.endsWith(')')) {
      str = str.substring(1, str.length - 1);
    } else {
      throw new Error();
    }
    const items = str.split(/\),\s*\(/);
    const result = items.map((item) => {
      item = item.replace(/^\(+|\)+$/g, '');
      const obj = parseKeyValuePairs(item);
      return obj;
    });
    return result;
  } catch (error) {
    console.error('Error parsing tuple array:', str, 'error:', error);
    return str;
  }
}

function reviver(key: string, value: never | string): unknown {
  if (typeof value === 'string') {
    if (/^\s*\(.*\)\s*$/.test(value)) {
      if (value.includes('=')) {
        return parseTupleArray(value);
      } else {
        return parseStringTuple(value);
      }
    }
  }
  return value;
}

function filterData<
  K extends SfyData['NativeClass'],
  F extends Extract<SfyData, { NativeClass: K }>['Classes'][number],
>(
  data: SfyData[],
  nativeClassFilter: K | K[],
  innerFilter: (d: F) => boolean,
): F[] {
  if (Array.isArray(nativeClassFilter)) {
    const result = [];
    for (const f of nativeClassFilter) {
      result.push(...filterData(data, f as K, innerFilter as any));
    }
    return result as any;
  }
  return data
    .filter((d) => d.NativeClass === nativeClassFilter)
    .map((d) => d.Classes)
    .flat()
    .filter(innerFilter as any) as F[];
}

function getId(s: string): string {
  return s.split('.').pop()?.replace("'", '') || '';
}

function readDataFile(filePath: string): SfyData[] {
  let fileContent = fs.readFileSync(filePath, 'utf16le');
  if (fileContent.charCodeAt(0) === 0xfeff) {
    fileContent = fileContent.slice(1);
  }
  fileContent = fileContent.replace(/\t/g, ' ');
  return JSON.parse(fileContent, reviver);
}

function processRecipes(data: SfyData[]): SfyRecipe[] {
  return filterData(
    data,
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'",
    (mRecipe) =>
      typeof mRecipe.mProducedIn !== 'string' &&
      (mRecipe.mProducedIn.every(
        (pi) =>
          pi !==
          '/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C',
      ) ||
        mRecipe.mProduct[0].ItemClass.includes('Factory/PipelineMk') ||
        mRecipe.mProduct[0].ItemClass.includes('Factory/ConveyorBelt')) &&
      !mRecipe.mDisplayName.includes('Discontinued'),
  );
}

function getTechnologies(data: SfyData[]): SfyResearch[] {
  return filterData(
    data,
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGSchematic'",
    (d: SfyResearch) =>
      d.mUnlocks.some(
        (c) =>
          c.Class === 'BP_UnlockRecipe_C' &&
          !c.mRecipes.every((r) => deniedRecipes.some((d) => r.includes(d))),
      ) &&
      !d.mDisplayName.includes('Discontinued') &&
      !['EST_Customization', 'EST_ResourceSink'].some(
        (mType) => d.mType === mType,
      ),
  );
}
function getDescriptions(data: SfyData[]): SfyDesc[] {
  return filterData(
    data,
    [
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'",
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGVehicleDescriptor'",
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGResourceDescriptor'",
    ],
    (_) => true,
  );
}
function getConveyors(data: SfyData[]): SfyConveyorBelt[] {
  return filterData(
    data,
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableConveyorBelt'",
    (_) => true,
  );
}
function getPipelines(data: SfyData[]): SfyPipeline[] {
  return filterData(
    data,
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildablePipeline'",
    (_) => true,
  );
}
function getResourceExtractors(data: SfyData[]): SfyResourceExtractor[] {
  return filterData(
    data,
    [
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableResourceExtractor'",
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableWaterPump'",
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableFrackingExtractor'",
    ],
    (_) => true,
  );
}

function getManufacturers(data: SfyData[]): SfyManufacturer[] {
  return filterData(
    data,
    [
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableManufacturer'",
      "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableManufacturerVariablePower'",
    ],
    (_) => true,
  );
}

function findClass<D extends { ClassName: string }>(
  data: D[],
  className: string,
): D | undefined {
  return data.find((d) => d.ClassName === className);
}

function findAllClasses<D extends { ClassName: string }>(
  data: D[],
  classNames: string[],
): D[] {
  return classNames
    .map((className) => findClass(data, className))
    .filter((c) => c !== undefined) as D[];
}

function extractItemsFromRecipes(recipes: SfyRecipe[]): Set<string> {
  const items = new Set<string>();
  for (const mRecipe of recipes) {
    for (const product of mRecipe.mProduct) {
      items.add(getId(product.ItemClass));
    }
    for (const ingredient of mRecipe.mIngredients) {
      if (typeof ingredient !== 'string') {
        items.add(getId(ingredient.ItemClass));
      }
    }
  }
  return items;
}

function stackSize(mStackSize: string): number | undefined {
  switch (mStackSize) {
    case 'SS_SMALL':
      return 50;
    case 'SS_MEDIUM':
      return 100;
    case 'SS_BIG':
      return 200;
    case 'SS_HUGE':
      return 500;
    default:
      return undefined;
  }
}

function buildModData(
  recipes: SfyRecipe[],
  technologies: SfyResearch[],
  items: Set<string>,
  descriptions: SfyDesc[],
  conveyors: SfyConveyorBelt[],
  pipelines: SfyPipeline[],
  extractors: SfyResourceExtractor[],
  manufacturers: SfyManufacturer[],
): ModData {
  const somersloopRecipes: string[] = [];
  const miningItems: string[] = [];
  const modData: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
    limitations: {},
  };

  const directUnlock: Map<string, SfyResearch> = new Map();

  // Process technologies
  for (const tech of technologies) {
    const unlocks = tech.mUnlocks.filter(
      (mu) => mu.Class === 'BP_UnlockSchematic_C',
    );
    for (const unlock of unlocks) {
      for (const schematic of unlock.mSchematics) {
        directUnlock.set(getId(schematic), tech);
      }
    }
  }
  for (const tech of technologies) {
    if (directUnlock.get(getId(tech.ClassName))) {
      continue;
    }
    modData.items.push({
      id: getId(tech.ClassName),
      row: 0,
      name: tech.mDisplayName,
      category: 'technology',
      technology: {
        prerequisites: tech.mSchematicDependencies
          .filter((dep) => dep.Class === 'BP_SchematicPurchasedDependency_C')
          .map((dep) => dep.mSchematics.map(getId))
          .flat(),
      },
    } as ItemJson);
  }
  // Process Recipes
  for (const _tech of technologies) {
    for (const techUnlock of _tech.mUnlocks.filter(
      (u) => u.Class === 'BP_UnlockRecipe_C',
    )) {
      const tech = directUnlock.get(getId(_tech.ClassName)) ?? _tech;
      for (const recipeClassName of techUnlock.mRecipes) {
        const mRecipe = recipes.find(
          (r) => r.ClassName === getId(recipeClassName),
        );
        if (
          !mRecipe ||
          typeof mRecipe.mProducedIn === 'string' ||
          mRecipe.mProducedIn.every((pi) =>
            pi.includes(
              '/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C',
            ),
          )
        ) {
          continue;
        }
        const inputs =
          mRecipe.mIngredients !== ''
            ? Object.fromEntries(
                mRecipe.mIngredients.map((i) => [getId(i.ItemClass), i.Amount]),
              )
            : {};
        const outputs = Object.fromEntries(
          mRecipe.mProduct.map((i) => [getId(i.ItemClass), i.Amount]),
        );
        const id = getId(mRecipe.ClassName);

        const recipe: RecipeJson = {
          name: mRecipe.mDisplayName,
          category: 'recipe',
          id,
          time: Math.round(parseFloat(mRecipe.mManufactoringDuration)),
          producers: mRecipe.mProducedIn
            .map((pi) => getId(pi))
            .filter(
              (pi) =>
                pi !== undefined && !deniedProducers.some((pr) => pr === pi),
            ),
          in: inputs,
          out: outputs,
          row: 0,
          unlockedBy: getId(tech.ClassName),
        };
        if (recipe.producers === undefined || recipe.producers.length === 0) {
          continue;
        }
        if (
          findAllClasses(manufacturers, recipe.producers).some(
            (m) => m.mProductionShardSlotSize !== '0',
          )
        ) {
          somersloopRecipes.push(id);
        }
        const existing = modData.recipes.findIndex(
          (modR) => modR.id === recipe.id,
        );
        if (existing !== -1 && typeof recipe.unlockedBy === 'string') {
          const unlockedBy = [
            modData.recipes[existing].unlockedBy,
          ].flat() as string[];
          unlockedBy.push(recipe.unlockedBy);
          modData.recipes[existing].unlockedBy = unlockedBy;
        } else {
          modData.recipes.push(recipe);
        }
      }
    }
  }
  for (const conveyor of conveyors) {
    modData.items.push({
      id: conveyor.ClassName,
      row: 0,
      name: conveyor.mDisplayName,
      category: 'other',
      belt: {
        speed: parseFloat(conveyor.mSpeed) / 120,
      },
    });
  }
  for (const pipeline of pipelines) {
    if (pipeline.mDisplayName.includes('Clean ')) continue;
    modData.items.push({
      id: pipeline.ClassName,
      row: 0,
      name: pipeline.mDisplayName,
      category: 'other',
      pipe: {
        speed: parseFloat(pipeline.mFlowLimit),
      },
    });
  }
  for (const extractor of extractors) {
    modData.items.push({
      id: extractor.ClassName,
      row: 0,
      name: extractor.mDisplayName,
      category: 'other',
      machine: {
        speed: 1 / parseFloat(extractor.mExtractCycleTime),
        type: EnergyType.Electric,
        usage: parseFloat(extractor.mPowerConsumption) * 1000,
      },
    });
  }
  for (const manufacturer of manufacturers) {
    modData.items.push({
      id: manufacturer.ClassName,
      row: 0,
      name: manufacturer.mDisplayName,
      category: 'other',
      machine: {
        modules: parseFloat(manufacturer.mProductionShardSlotSize) ?? undefined,
        type: EnergyType.Electric,
        usage: parseFloat(manufacturer.mPowerConsumption) * 1000,
        speed: parseFloat(manufacturer.mManufacturingSpeed),
      },
    });
  }
  for (const car of findAllClasses(descriptions, ['Desc_FreightWagon_C'])) {
    if (car.ClassName === 'Desc_FreightWagon_C') {
      const stacksize = parseFloat(car.mInventorySize ?? '0');
      modData.items.push({
        id: getId(car.ClassName),
        row: 0,
        name: car.mDisplayName,
        category: 'other',
        cargoWagon: {
          size: stacksize,
        },
        fluidWagon: {
          capacity: stacksize * 50,
        },
      });
    }
  }
  for (const item of items) {
    const desc = findClass(descriptions, item);
    if (desc && desc.mForm !== 'RF_INVALID') {
      let fuel;
      if (parseFloat(desc.mEnergyValue) !== 0) {
        fuel = {
          category: desc.mForm !== 'RF_SOLID' ? 'chemical' : 'fluid',
          value:
            parseFloat(desc.mEnergyValue) *
            (desc.mForm === 'RF_SOLID' ? 1 : 1000),
        };
      }
      modData.items.push({
        id: item,
        row: 0,
        name: desc.mDisplayName,
        category: 'components',
        stack: stackSize(desc.mStackSize),
        fuel,
      });
      if (desc.mManualMiningAudioName) {
        miningItems.push(item);
      }
    }
  }

  // Process Icons
  const itemIcons = [...modData.items].map((item) => ({
    id: item.id,
    position: '-576px -0px',
    color: '#746255',
  }));
  const recipeIcons = modData.recipes.map((recipe) => ({
    id: recipe.id,
    position: '-576px -0px',
    color: '#746255',
  }));
  modData.icons.push(...itemIcons, ...recipeIcons);

  // Limitations
  modData.limitations['mining'] = miningItems;
  modData.limitations['somersloop'] = somersloopRecipes;

  return modData;
}

function convertToOldIds(
  json: ModData,
  idMap: Record<string, string>,
): ModData {
  function convert(idMap: Record<string, string>, current: string): string {
    return idMap[current] ?? current;
  }

  // convert new ids to old ids
  const transform = (obj: any): any => {
    if (typeof obj === 'string') {
      return convert(idMap, obj);
    }
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    return Object.keys(obj).reduce(
      (acc: Record<string, any>, key: string) => {
        const newKey = convert(idMap, key);
        acc[newKey] = transform(obj[key]);
        return acc;
      },
      Array.isArray(obj) ? [] : ({} as Record<string, any>),
    );
  };
  return transform(json);
}

function updateModHash(modData: ModData, oldHash: ModHash): ModHash {
  const modHashReport = emptyModHash();
  function addIfMissing(hash: ModHash, key: keyof ModHash, id: string): void {
    if (hash[key] == null) hash[key] = [];
    if (hash[key].indexOf(id) === -1) {
      hash[key].push(id);
      modHashReport[key].push(id);
    }
  }
  modData.items.forEach((i) => {
    addIfMissing(oldHash, 'items', i.id);
    if (i.beacon) addIfMissing(oldHash, 'beacons', i.id);
    if (i.belt) addIfMissing(oldHash, 'belts', i.id);
    if (i.fuel) addIfMissing(oldHash, 'fuels', i.id);
    if (i.cargoWagon || i.fluidWagon) addIfMissing(oldHash, 'wagons', i.id);
    if (i.machine) addIfMissing(oldHash, 'machines', i.id);
    if (i.technology) addIfMissing(oldHash, 'technologies', i.id);
  });
  modData.recipes.forEach((r) => addIfMissing(oldHash, 'recipes', r.id));
  return oldHash;
}

/** Main */

function main() {
  const satisfactoryPath = process.argv[2];
  if (!satisfactoryPath) {
    throw new Error(
      'Please specify path to satisfactory installation directory',
    );
  }
  const docsPath = `${satisfactoryPath}/CommunityResources/Docs`;
  const enUsPath = `${docsPath}/en-US.json`;
  const data: SfyData[] = readDataFile(enUsPath);

  const recipes = processRecipes(data);
  const items = extractItemsFromRecipes(recipes);

  const technologies = getTechnologies(data);
  const descriptions = getDescriptions(data);
  const conveyors = getConveyors(data);
  const pipelines = getPipelines(data);
  const extractors = getResourceExtractors(data);
  const manufacturers = getManufacturers(data);

  const modPath = `./src/data/sfy`;
  const modDataPath = `${modPath}/data.json`;
  const modHashPath = `${modPath}/hash.json`;
  const oldIdsMapPath = `${modPath}/old_ids.json`;

  const oldIdsMap: Record<string, string> = JSON.parse(
    fs.readFileSync(oldIdsMapPath, 'utf8'),
  );

  const modData = convertToOldIds(
    buildModData(
      recipes,
      technologies,
      items,
      descriptions,
      conveyors,
      pipelines,
      extractors,
      manufacturers,
    ),
    oldIdsMap,
  );

  const oldData: ModData = JSON.parse(fs.readFileSync(modDataPath, 'utf8'));
  const oldHash: ModHash = JSON.parse(fs.readFileSync(modHashPath, 'utf8'));

  modData.defaults = oldData.defaults;

  const updatedHash = updateModHash(modData, oldHash);

  fs.writeFileSync(modHashPath, JSON.stringify(updatedHash, null, 4));
  fs.writeFileSync(modDataPath, JSON.stringify(modData, null, 4));
}

main();
