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
  const itemIcons = [...items.values()].map((item) => ({
    id: item,
    position: '-576px -0px',
    color: '#746255',
  }));
  const technologyIcons = technologies.map((tech) => ({
    id: `${getId(tech.ClassName)}`,
    position: '-576px -0px',
    color: '#746255',
  }));
  const recipeIcons = modData.recipes.map((recipe) => ({
    id: recipe.id,
    position: '-576px -0px',
    color: '#746255',
  }));
  modData.icons.push(...itemIcons, ...technologyIcons, ...recipeIcons);

  // Limitations
  modData.limitations['mining'] = miningItems;
  modData.limitations['somersloop'] = somersloopRecipes;

  return modData;
}

function convertToOldIds(json: ModData) {
  // holds new id to old id mapping and converts it in place
  function convert(idMap: Map<string, string>, current: string): string {
    return idMap.get(current) ?? current;
  }
  // Desc_IronIngot_C -> iron-ingot
  // Desc_IronPlateReinforced_C ->
  const idMap: Map<string, string> = new Map([
    ['Research_Sulfur_RocketFuel_C', 'rocket-fuel'],
    ['Desc_RocketFuel_C', 'rocket-fuel'],
    ['Recipe_RocketFuel_C', 'rocket-fuel'],
    ['Schematic_Alternate_RocketFuel_Nitro_C', 'rocket-fuel-nitro'],
    ['Recipe_Alternate_RocketFuel_Nitro_C', 'rocket-fuel-nitro'],
    ['Research_Sulfur_IonizedFuel_C', 'ionized-fuel'],
    ['Desc_IonizedFuel_C', 'ionized-fuel'],
    ['Recipe_IonizedFuel_C', 'ionized-fuel'],
    ['Schematic_Alternate_IonizedFuel_Dark_C', 'dark-ionized-fuel'],
    ['Recipe_Alternate_IonizedFuel_Dark_C', 'dark-ionized-fuel'],
    ['Research_Sulfur_TurboFuel_C', 'turbofuel'],
    ['Desc_LiquidTurboFuel_C', 'turbofuel'],
    ['Recipe_Alternate_Turbofuel_C', 'turbofuel'],
    ['Schematic_Alternate_Diamond_Turbo_C', 'turbo-diamonds'],
    ['Recipe_Alternate_Diamond_Turbo_C', 'turbo-diamonds'],
    ['Schematic_Alternate_Diamond_Pink_C', 'pink-diamonds'],
    ['Recipe_Alternate_Diamond_Pink_C', 'pink-diamonds'],
    ['Schematic_Alternate_Diamond_Petroleum_C', 'petroleum-coke-diamonds'],
    ['Recipe_Alternate_Diamond_Petroleum_C', 'petroleum-coke-diamonds'],
    ['Schematic_Alternate_Diamond_OilBased_C', 'crude-oil-diamonds'],
    ['Recipe_Alternate_Diamond_OilBased_C', 'crude-oil-diamonds'],
    ['Schematic_Alternate_Diamond_Cloudy_C', 'limestone-diamonds'],
    ['Recipe_Alternate_Diamond_Cloudy_C', 'limestone-diamonds'],
    ['Schematic_Alternate_DarkMatter_Trap_C', 'dark-matter-trap'],
    ['Recipe_Alternate_DarkMatter_Trap_C', 'dark-matter-trap'],
    [
      'Schematic_Alternate_DarkMatter_Crystallization_C',
      'dark-matter-crystallization',
    ],
    [
      'Recipe_Alternate_DarkMatter_Crystallization_C',
      'dark-matter-crystallization',
    ],
    ['Schematic_Alternate_WetConcrete_C', 'concrete-wet'],
    ['Recipe_Alternate_WetConcrete_C', 'concrete-wet'],
    ['Schematic_Alternate_TurboHeavyFuel_C', 'turbofuel-heavy'],
    ['Recipe_Alternate_TurboHeavyFuel_C', 'turbofuel-heavy'],
    ['Schematic_Alternate_SteelRod_C', 'iron-rod-steel'],
    ['Recipe_Alternate_SteelRod_C', 'iron-rod-steel'],
    ['Schematic_Alternate_SteelCanister_C', 'empty-canister-steel'],
    ['Recipe_Alternate_SteelCanister_C', 'empty-canister-steel'],
    ['Schematic_Alternate_SteamedCopperSheet_C', 'copper-sheet-steamed'],
    ['Recipe_Alternate_SteamedCopperSheet_C', 'copper-sheet-steamed'],
    ['Schematic_Alternate_RubberConcrete_C', 'concrete-rubber'],
    ['Recipe_Alternate_RubberConcrete_C', 'concrete-rubber'],
    ['Schematic_Alternate_RecycledRubber_C', 'rubber-recycled'],
    ['Recipe_Alternate_RecycledRubber_C', 'rubber-recycled'],
    ['Schematic_Alternate_PureQuartzCrystal_C', 'quartz-crystal-pure'],
    ['Recipe_Alternate_PureQuartzCrystal_C', 'quartz-crystal-pure'],
    ['Schematic_Alternate_PureIronIngot_C', 'iron-ingot-pure'],
    ['Recipe_Alternate_PureIronIngot_C', 'iron-ingot-pure'],
    ['Schematic_Alternate_PureCopperIngot_C', 'copper-ingot-pure'],
    ['Recipe_Alternate_PureCopperIngot_C', 'copper-ingot-pure'],
    ['Schematic_Alternate_PureCateriumIngot_C', 'caterium-ingot-pure'],
    ['Recipe_Alternate_PureCateriumIngot_C', 'caterium-ingot-pure'],
    ['Schematic_Alternate_PureAluminumIngot_C', 'aluminum-ingot-pure'],
    ['Recipe_PureAluminumIngot_C', 'aluminum-ingot-pure'],
    ['Schematic_Alternate_PolymerResin_C', 'polymer-resin'],
    ['Desc_PolymerResin_C', 'polymer-resin'],
    ['Recipe_Alternate_PolymerResin_C', 'polymer-resin'],
    ['Schematic_Alternate_PlasticSmartPlating_C', 'smart-plating-plastic'],
    ['Recipe_Alternate_PlasticSmartPlating_C', 'smart-plating-plastic'],
    ['Research_Caterium_4_1_C', 'ai-limiter'],
    ['Desc_CircuitBoardHighSpeed_C', 'ai-limiter'],
    ['Recipe_AILimiter_C', 'ai-limiter'],
    ['Schematic_Alternate_HighSpeedWiring_C', 'automated-wiring-high-speed'],
    ['Recipe_Alternate_HighSpeedWiring_C', 'automated-wiring-high-speed'],
    ['Schematic_Alternate_HeavyOilResidue_C', 'heavy-oil-residue'],
    ['Desc_HeavyOilResidue_C', 'heavy-oil-residue'],
    ['Recipe_Alternate_HeavyOilResidue_C', 'heavy-oil-residue'],
    [
      'Schematic_Alternate_HeavyFlexibleFrame_C',
      'heavy-modular-frame-flexible',
    ],
    ['Recipe_Alternate_HeavyFlexibleFrame_C', 'heavy-modular-frame-flexible'],
    ['Schematic_Alternate_FusedWire_C', 'wire-fused'],
    ['Recipe_Alternate_FusedWire_C', 'wire-fused'],
    ['Schematic_Alternate_FlexibleFramework_C', 'versatile-framework-flexible'],
    ['Recipe_Alternate_FlexibleFramework_C', 'versatile-framework-flexible'],
    ['Schematic_Alternate_ElectrodeCircuitBoard_C', 'circuit-board-electrode'],
    ['Recipe_Alternate_ElectrodeCircuitBoard_C', 'circuit-board-electrode'],
    ['Schematic_Alternate_ElectroAluminumScrap_C', 'aluminum-scrap-electrode'],
    ['Recipe_Alternate_ElectroAluminumScrap_C', 'aluminum-scrap-electrode'],
    ['Schematic_Alternate_DilutedPackagedFuel_C', 'packaged-fuel-diluted'],
    ['Recipe_Alternate_DilutedPackagedFuel_C', 'packaged-fuel-diluted'],
    ['Schematic_Alternate_CopperRotor_C', 'rotor-copper'],
    ['Recipe_Alternate_CopperRotor_C', 'rotor-copper'],
    ['Schematic_Alternate_CopperAlloyIngot_C', 'copper-ingot-alloy'],
    ['Recipe_Alternate_CopperAlloyIngot_C', 'copper-ingot-alloy'],
    ['Schematic_Alternate_CokeSteelIngot_C', 'steel-ingot-coke'],
    ['Recipe_Alternate_CokeSteelIngot_C', 'steel-ingot-coke'],
    ['Schematic_Alternate_CoatedIronPlate_C', 'iron-plate-coated'],
    ['Recipe_Alternate_CoatedIronPlate_C', 'iron-plate-coated'],
    ['Schematic_Alternate_CoatedIronCanister_C', 'empty-canister-coated-iron'],
    ['Recipe_Alternate_CoatedIronCanister_C', 'empty-canister-coated-iron'],
    ['Schematic_Alternate_CoatedCable_C', 'cable-coated'],
    ['Recipe_Alternate_CoatedCable_C', 'cable-coated'],
    ['Schematic_Alternate_BoltedFrame_C', 'modular-frame-bolted'],
    ['Recipe_Alternate_BoltedFrame_C', 'modular-frame-bolted'],
    ['Schematic_Alternate_AdheredIronPlate_C', 'reinforced-iron-plate-adhered'],
    ['Recipe_Alternate_AdheredIronPlate_C', 'reinforced-iron-plate-adhered'],
    ['Schematic_Alternate_TurboPressureMotor_C', 'turbo-motor-pressure'],
    ['Recipe_Alternate_TurboPressureMotor_C', 'turbo-motor-pressure'],
    ['Schematic_Alternate_TurboBlendFuel_C', 'turbofuel-blend'],
    ['Recipe_Alternate_TurboBlendFuel_C', 'turbofuel-blend'],
    ['Schematic_Alternate_SuperStateComputer_C', 'supercomputer-super-state'],
    ['Recipe_Alternate_SuperStateComputer_C', 'supercomputer-super-state'],
    ['Schematic_Alternate_SloppyAlumina_C', 'alumina-solution-sloppy'],
    ['Recipe_Alternate_SloppyAlumina_C', 'alumina-solution-sloppy'],
    ['Schematic_Alternate_RadioControlSystem_C', 'radio-control-unit-system'],
    ['Recipe_Alternate_RadioControlSystem_C', 'radio-control-unit-system'],
    ['Schematic_Alternate_PlutoniumFuelUnit_C', 'plutonium-fuel-rod-unit'],
    ['Recipe_Alternate_PlutoniumFuelUnit_C', 'plutonium-fuel-rod-unit'],
    ['Schematic_Alternate_OCSupercomputer_C', 'supercomputer-oc'],
    ['Recipe_Alternate_OCSupercomputer_C', 'supercomputer-oc'],
    ['Schematic_Alternate_InstantScrap_C', 'aluminum-scrap-instant'],
    ['Recipe_Alternate_InstantScrap_C', 'aluminum-scrap-instant'],
    [
      'Schematic_Alternate_InstantPlutoniumCell_C',
      'encased-plutonium-cell-instant',
    ],
    [
      'Recipe_Alternate_InstantPlutoniumCell_C',
      'encased-plutonium-cell-instant',
    ],
    ['Schematic_Alternate_HeatFusedFrame_C', 'fused-modular-frame-heat'],
    ['Recipe_Alternate_HeatFusedFrame_C', 'fused-modular-frame-heat'],
    ['Schematic_Alternate_FertileUranium_C', 'non-fissile-uranium-fertile'],
    ['Recipe_Alternate_FertileUranium_C', 'non-fissile-uranium-fertile'],
    ['Schematic_Alternate_ElectricMotor_C', 'motor-electric'],
    ['Recipe_Alternate_ElectricMotor_C', 'motor-electric'],
    ['Schematic_Alternate_DilutedFuel_C', 'fuel-diluted'],
    ['Recipe_Alternate_DilutedFuel_C', 'fuel-diluted'],
    ['Schematic_Alternate_CoolingDevice_C', 'cooling-system-device'],
    ['Recipe_Alternate_CoolingDevice_C', 'cooling-system-device'],
    ['Schematic_Alternate_ClassicBattery_C', 'battery-classic'],
    ['Recipe_Alternate_ClassicBattery_C', 'battery-classic'],
    ['Schematic_Alternate_AutomatedMiner_C', 'portable-miner'],
    ['Recipe_Alternate_AutomatedMiner_C', 'portable-miner'],
    ['Schematic_Alternate_AlcladCasing_C', 'aluminum-casing-alclad'],
    ['Recipe_Alternate_AlcladCasing_C', 'aluminum-casing-alclad'],
    ['Schematic_Alternate_SteelPipe_Molded_C', 'molded-steel-pipe'],
    ['Recipe_Alternate_SteelPipe_Molded_C', 'molded-steel-pipe'],
    ['Schematic_Alternate_SteelPipe_Iron_C', 'iron-pipe'],
    ['Recipe_Alternate_SteelPipe_Iron_C', 'iron-pipe'],
    ['Schematic_Alternate_SteelCastedPlate_C', 'iron-plate-steel'],
    ['Recipe_Alternate_SteelCastedPlate_C', 'iron-plate-steel'],
    ['Schematic_Alternate_SteelBeam_Molded_C', 'molded-beam'],
    ['Recipe_Alternate_SteelBeam_Molded_C', 'molded-beam'],
    ['Schematic_Alternate_SteelBeam_Aluminum_C', 'aluminum-beam'],
    ['Recipe_Alternate_SteelBeam_Aluminum_C', 'aluminum-beam'],
    ['Schematic_Alternate_AluminumRod_C', 'iron-rod-aluminum'],
    ['Recipe_Alternate_AluminumRod_C', 'iron-rod-aluminum'],
    ['Schematic_Alternate_AILimiter_Plastic_C', 'plastic-ai-limiter'],
    ['Recipe_Alternate_AILimiter_Plastic_C', 'plastic-ai-limiter'],
    ['Schematic_Alternate_Quartz_Purified_C', 'quartz-purification'],
    ['Recipe_Alternate_Quartz_Purified_C', 'quartz-purification'],
    ['Schematic_Alternate_Quartz_Fused_C', 'quartz-crystal-fused'],
    ['Recipe_Alternate_Quartz_Fused_C', 'quartz-crystal-fused'],
    ['Schematic_Alternate_IronIngot_Leached_C', 'iron-ingot-leached'],
    ['Recipe_Alternate_IronIngot_Leached_C', 'iron-ingot-leached'],
    ['Schematic_Alternate_IronIngot_Basic_C', 'iron-ingot-basic'],
    ['Recipe_Alternate_IronIngot_Basic_C', 'iron-ingot-basic'],
    ['Schematic_Alternate_CopperIngot_Tempered_C', 'copper-ingot-tempered'],
    ['Recipe_Alternate_CopperIngot_Tempered_C', 'copper-ingot-tempered'],
    ['Schematic_Alternate_CopperIngot_Leached_C', 'copper-ingot-leached'],
    ['Recipe_Alternate_CopperIngot_Leached_C', 'copper-ingot-leached'],
    ['Schematic_Alternate_CateriumIngot_Tempered_C', 'caterium-ingot-tempered'],
    ['Recipe_Alternate_CateriumIngot_Tempered_C', 'caterium-ingot-tempered'],
    ['Schematic_Alternate_CateriumIngot_Leached_C', 'caterium-ingot-leached'],
    ['Recipe_Alternate_CateriumIngot_Leached_C', 'caterium-ingot-leached'],
    ['Schematic_Alternate_Wire2_C', 'wire-caterium'],
    ['Recipe_Alternate_Wire_2_C', 'wire-caterium'],
    ['Schematic_Alternate_Wire1_C', 'wire-iron'],
    ['Recipe_Alternate_Wire_1_C', 'wire-iron'],
    ['Schematic_Alternate_UraniumCell1_C', 'encased-uranium-cell-infused'],
    ['Recipe_Alternate_UraniumCell_1_C', 'encased-uranium-cell-infused'],
    ['Schematic_Alternate_TurboMotor1_C', 'turbo-motor-electric'],
    ['Recipe_Alternate_TurboMotor_1_C', 'turbo-motor-electric'],
    ['Schematic_Alternate_Stator_C', 'stator-quickwire'],
    ['Recipe_Alternate_Stator_C', 'stator-quickwire'],
    ['Research_Quartz_1_2_C', 'silica'],
    ['Desc_Silica_C', 'silica'],
    ['Recipe_Silica_C', 'silica'],
    ['Schematic_Alternate_Silica_C', 'silica-cheap'],
    ['Recipe_Alternate_Silica_C', 'silica-cheap'],
    ['Schematic_Alternate_Screw2_C', 'screw-steel'],
    ['Recipe_Alternate_Screw_2_C', 'screw-steel'],
    ['Schematic_Alternate_Screw_C', 'screw-cast'],
    ['Recipe_Alternate_Screw_C', 'screw-cast'],
    ['Schematic_Alternate_Rotor_C', 'rotor-steel'],
    ['Recipe_Alternate_Rotor_C', 'rotor-steel'],
    [
      'Schematic_Alternate_ReinforcedSteelPlate_C',
      'encased-industrial-beam-pipe',
    ],
    [
      'Recipe_Alternate_EncasedIndustrialBeam_C',
      'encased-industrial-beam-pipe',
    ],
    [
      'Schematic_Alternate_ReinforcedIronPlate2_C',
      'reinforced-iron-plate-stitched',
    ],
    [
      'Recipe_Alternate_ReinforcedIronPlate_2_C',
      'reinforced-iron-plate-stitched',
    ],
    [
      'Schematic_Alternate_ReinforcedIronPlate1_C',
      'reinforced-iron-plate-bolted',
    ],
    [
      'Recipe_Alternate_ReinforcedIronPlate_1_C',
      'reinforced-iron-plate-bolted',
    ],
    ['Research_Caterium_5_C', 'high-speed-connector'],
    ['Desc_HighSpeedConnector_C', 'high-speed-connector'],
    ['Recipe_HighSpeedConnector_C', 'high-speed-connector'],
    [
      'Schematic_Alternate_RadioControlUnit1_C',
      'radio-control-unit-connection',
    ],
    ['Recipe_Alternate_RadioControlUnit_1_C', 'radio-control-unit-connection'],
    ['Schematic_Alternate_Quickwire_C', 'quickwire-fused'],
    ['Recipe_Alternate_Quickwire_C', 'quickwire-fused'],
    ['Schematic_Alternate_Plastic1_C', 'plastic-recycled'],
    ['Recipe_Alternate_Plastic_1_C', 'plastic-recycled'],
    ['Schematic_Alternate_NuclearFuelRod1_C', 'uranium-fuel-rod-unit'],
    ['Recipe_Alternate_NuclearFuelRod_1_C', 'uranium-fuel-rod-unit'],
    ['Schematic_Alternate_Motor1_C', 'motor-rigour'],
    ['Recipe_Alternate_Motor_1_C', 'motor-rigour'],
    ['Schematic_Alternate_ModularFrame_C', 'modular-frame-steeled'],
    ['Recipe_Alternate_ModularFrame_C', 'modular-frame-steeled'],
    ['Schematic_Alternate_IngotSteel2_C', 'steel-ingot-compacted'],
    ['Recipe_Alternate_IngotSteel_2_C', 'steel-ingot-compacted'],
    ['Schematic_Alternate_IngotSteel1_C', 'steel-ingot-solid'],
    ['Recipe_Alternate_IngotSteel_1_C', 'steel-ingot-solid'],
    ['Schematic_Alternate_IngotIron_C', 'iron-ingot-alloy'],
    ['Recipe_Alternate_IngotIron_C', 'iron-ingot-alloy'],
    [
      'Schematic_Alternate_HighSpeedConnector_C',
      'high-speed-connector-silicon',
    ],
    ['Recipe_Alternate_HighSpeedConnector_C', 'high-speed-connector-silicon'],
    ['Schematic_Alternate_HeavyModularFrame_C', 'heavy-modular-frame-encased'],
    ['Recipe_Alternate_ModularFrameHeavy_C', 'heavy-modular-frame-encased'],
    ['Schematic_Alternate_HeatSink1_C', 'heat-sink-exchanger'],
    ['Recipe_Alternate_HeatSink_1_C', 'heat-sink-exchanger'],
    ['Schematic_Alternate_Gunpowder1_C', 'black-powder-fine'],
    ['Recipe_Alternate_Gunpowder_1_C', 'black-powder-fine'],
    [
      'Schematic_Alternate_ElectromagneticControlRod1_C',
      'electromagnetic-control-rod-connection',
    ],
    [
      'Recipe_Alternate_ElectromagneticControlRod_1_C',
      'electromagnetic-control-rod-connection',
    ],
    ['Research_Quartz_2_C', 'crystal-oscillator'],
    ['Desc_CrystalOscillator_C', 'crystal-oscillator'],
    ['Recipe_CrystalOscillator_C', 'crystal-oscillator'],
    ['Schematic_Alternate_CrystalOscillator_C', 'crystal-oscillator-insulated'],
    ['Recipe_Alternate_CrystalOscillator_C', 'crystal-oscillator-insulated'],
    ['Schematic_Alternate_Concrete_C', 'concrete-fine'],
    ['Recipe_Alternate_Concrete_C', 'concrete-fine'],
    ['Schematic_Alternate_Computer2_C', 'computer-crystal'],
    ['Recipe_Alternate_Computer_2_C', 'computer-crystal'],
    ['Schematic_Alternate_Computer1_C', 'computer-caterium'],
    ['Recipe_Alternate_Computer_1_C', 'computer-caterium'],
    ['Schematic_Alternate_Coal2_C', 'biocoal'],
    ['Recipe_Alternate_Coal_2_C', 'biocoal'],
    ['Schematic_Alternate_Coal1_C', 'charcoal'],
    ['Recipe_Alternate_Coal_1_C', 'charcoal'],
    ['Schematic_Alternate_CircuitBoard2_C', 'circuit-board-caterium'],
    ['Recipe_Alternate_CircuitBoard_2_C', 'circuit-board-caterium'],
    ['Schematic_Alternate_CircuitBoard1_C', 'circuit-board-silicon'],
    ['Recipe_Alternate_CircuitBoard_1_C', 'circuit-board-silicon'],
    ['Schematic_Alternate_Cable2_C', 'cable-quickwire'],
    ['Recipe_Alternate_Cable_2_C', 'cable-quickwire'],
    ['Schematic_Alternate_Cable1_C', 'cable-insulated'],
    ['Recipe_Alternate_Cable_1_C', 'cable-insulated'],
    ['Schematic_8-3_C', 'hoverpack'],
    ['Recipe_Hoverpack_C', 'hoverpack'],
    ['Schematic_7-3_C', 'hazmat-suit'],
    ['Recipe_HazmatSuit_C', 'hazmat-suit'],
    ['Schematic_6-2_C', 'jetpack'],
    ['Recipe_JetPack_C', 'jetpack'],
    ['Research_Mycelia_1_C', 'mycelia'],
    ['Research_Sulfur_1_C', 'black-powder'],
    ['Desc_Gunpowder_C', 'black-powder'],
    ['Recipe_Gunpowder_C', 'black-powder'],
    ['Research_Alien_SAMFluctuator_C', 'sam-fluctuator'],
    ['Desc_SAMFluctuator_C', 'sam-fluctuator'],
    ['Recipe_SAMFluctuator_C', 'sam-fluctuator'],
    ['Research_Caterium_4_3_C', 'blade-runners'],
    ['Recipe_BladeRunners_C', 'blade-runners'],
    ['Research_Caterium_3_2_C', 'stun-rebar'],
    ['Recipe_Rebar_Stunshot_C', 'stun-rebar'],
    ['Research_Caterium_2_1_C', 'zipline'],
    ['Recipe_ZipLine_C', 'zipline'],
    ['Research_Caterium_2_C', 'quickwire'],
    ['Desc_HighSpeedWire_C', 'quickwire'],
    ['Recipe_Quickwire_C', 'quickwire'],
    ['Research_Mycelia_GasMask_C', 'gas-mask'],
    ['Recipe_Gasmask_C', 'gas-mask'],
    ['Research_Mycelia_3_C', 'parachute'],
    ['Recipe_Parachute_C', 'parachute'],
    ['Research_Mycelia_2_C', 'fabric'],
    ['Recipe_Fabric_C', 'fabric'],
    ['Research_Quartz_2_1_C', 'shatter-rebar'],
    ['Recipe_Rebar_Spreadshot_C', 'shatter-rebar'],
    ['Research_Sulfur_CompactedCoal_C', 'compacted-coal'],
    ['Desc_CompactedCoal_C', 'compacted-coal'],
    ['Recipe_Alternate_EnrichedCoal_C', 'compacted-coal'],
    ['Research_Sulfur_5_2_C', 'turbo-rifle-ammo'],
    ['Recipe_CartridgeChaos_Packaged_C', 'turbo-rifle-ammo'],
    ['Recipe_CartridgeChaos_C', 'turbo-rifle-ammo'],
    ['Research_Sulfur_4_2_C', 'explosive-rebar'],
    ['Recipe_Rebar_Explosive_C', 'explosive-rebar'],
    ['Research_Sulfur_4_C', 'cluster-nobelisk'],
    ['Recipe_NobeliskCluster_C', 'cluster-nobelisk'],
    ['Research_Sulfur_3_C', 'smokeless-powder'],
    ['Desc_GunpowderMK2_C', 'smokeless-powder'],
    ['Recipe_GunpowderMK2_C', 'smokeless-powder'],
    ['Build_ConveyorBeltMk1_C', 'conveyor-belt-mk1'],
    ['Build_ConveyorBeltMk5_C', 'conveyor-belt-mk5'],
    ['Build_ConveyorBeltMk6_C', 'conveyor-belt-mk6'],
    ['Build_ConveyorBeltMk4_C', 'conveyor-belt-mk4'],
    ['Build_ConveyorBeltMk3_C', 'conveyor-belt-mk3'],
    ['Build_ConveyorBeltMk2_C', 'conveyor-belt-mk2'],
    ['Build_Pipeline_C', 'pipeline-mk1'],
    ['Build_PipelineMK2_C', 'pipeline-mk2'],
    ['Build_OilPump_C', 'oil-extractor'],
    ['Build_MinerMk2_C', 'miner-mk2'],
    ['Build_MinerMk1_C', 'miner-mk1'],
    ['Build_MinerMk3_C', 'miner-mk3'],
    ['Build_WaterPump_C', 'water-extractor'],
    ['Build_FrackingExtractor_C', 'resource-well-extractor'],
    ['Build_OilRefinery_C', 'refinery'],
    ['Build_FoundryMk1_C', 'foundry'],
    ['Build_Packager_C', 'packager'],
    ['Build_ManufacturerMk1_C', 'manufacturer'],
    ['Build_AssemblerMk1_C', 'assembler'],
    ['Build_Blender_C', 'blender'],
    ['Build_SmelterMk1_C', 'smelter'],
    ['Build_ConstructorMk1_C', 'constructor-id'],
    ['Build_QuantumEncoder_C', 'quantum-encoder'],
    ['Build_Converter_C', 'converter'],
    ['Build_HadronCollider_C', 'particle-accelerator'],
    ['Desc_FreightWagon_C', 'freight-car'],
    ['Desc_IronPlate_C', 'iron-plate'],
    ['Recipe_IronPlate_C', 'iron-plate'],
    ['Desc_IronIngot_C', 'iron-ingot'],
    ['Recipe_IngotIron_C', 'iron-ingot'],
    ['Desc_IronRod_C', 'iron-rod'],
    ['Recipe_IronRod_C', 'iron-rod'],
    ['Desc_IronPlateReinforced_C', 'reinforced-iron-plate'],
    ['Recipe_IronPlateReinforced_C', 'reinforced-iron-plate'],
    ['Desc_Cable_C', 'cable'],
    ['Recipe_Cable_C', 'cable'],
    ['Desc_Wire_C', 'wire'],
    ['Recipe_Wire_C', 'wire'],
    ['Desc_OreIron_C', 'iron-ore'],
    ['Desc_LiquidFuel_C', 'fuel'],
    ['Recipe_LiquidFuel_C', 'fuel'],
    ['Desc_NitrogenGas_C', 'nitrogen-gas'],
    ['Desc_Sulfur_C', 'sulfur'],
    ['Desc_Coal_C', 'coal'],
    ['Desc_NitricAcid_C', 'nitric-acid'],
    ['Recipe_NitricAcid_C', 'nitric-acid'],
    ['Desc_PackagedRocketFuel_C', 'packaged-rocket-fuel'],
    ['Recipe_PackagedRocketFuel_C', 'packaged-rocket-fuel'],
    ['Desc_GasTank_C', 'empty-fluid-tank'],
    ['Recipe_GasTank_C', 'empty-fluid-tank'],
    ['Desc_DarkMatter_C', 'dark-matter-crystal'],
    ['Recipe_DarkMatter_C', 'dark-matter-crystal'],
    ['Desc_DarkEnergy_C', 'dark-matter-residue'],
    ['Recipe_DarkEnergy_C', 'dark-matter-residue'],
    ['Desc_SAMIngot_C', 'reanimated-sam'],
    ['Recipe_IngotSAM_C', 'reanimated-sam'],
    ['Desc_QuantumEnergy_C', 'excited-photonic-matter'],
    ['Recipe_QuantumEnergy_C', 'excited-photonic-matter'],
    ['Desc_Diamond_C', 'diamonds'],
    ['Recipe_Diamond_C', 'diamonds'],
    ['Desc_QuantumOscillator_C', 'superposition-oscillator'],
    ['Recipe_SuperpositionOscillator_C', 'superposition-oscillator'],
    ['Desc_AluminumPlate_C', 'alclad-aluminum-sheet'],
    ['Recipe_AluminumSheet_C', 'alclad-aluminum-sheet'],
    ['Desc_TemporalProcessor_C', 'neural-quantum-processor'],
    ['Recipe_TemporalProcessor_C', 'neural-quantum-processor'],
    ['Desc_TimeCrystal_C', 'time-crystal'],
    ['Recipe_TimeCrystal_C', 'time-crystal'],
    ['Desc_ComputerSuper_C', 'supercomputer'],
    ['Recipe_ComputerSuper_C', 'supercomputer'],
    ['Desc_FicsiteMesh_C', 'ficsite-trigon'],
    ['Recipe_FicsiteMesh_C', 'ficsite-trigon'],
    ['Desc_SpaceElevatorPart_12_C', 'ai-expansion-server'],
    ['Recipe_SpaceElevatorPart_12_C', 'ai-expansion-server'],
    ['Desc_SpaceElevatorPart_6_C', 'magnetic-field-generator'],
    ['Recipe_SpaceElevatorPart_6_C', 'magnetic-field-generator'],
    ['Desc_PackagedIonizedFuel_C', 'packaged-ionized-fuel'],
    ['Recipe_PackagedIonizedFuel_C', 'packaged-ionized-fuel'],
    ['Desc_TurboFuel_C', 'packaged-turbofuel'],
    ['Recipe_PackagedTurboFuel_C', 'packaged-turbofuel'],
    ['Desc_SteelPipe_C', 'steel-pipe'],
    ['Recipe_SteelPipe_C', 'steel-pipe'],
    ['Desc_FicsiteIngot_C', 'ficsite-ingot'],
    ['Desc_SpaceElevatorPart_10_C', 'biochemical-sculptor'],
    ['Recipe_SpaceElevatorPart_10_C', 'biochemical-sculptor'],
    ['Desc_SpaceElevatorPart_7_C', 'assembly-director-system'],
    ['Recipe_SpaceElevatorPart_7_C', 'assembly-director-system'],
    ['Desc_Water_C', 'water'],
    ['Desc_AluminumIngot_C', 'aluminum-ingot'],
    ['Recipe_IngotAluminum_C', 'aluminum-ingot'],
    ['Desc_GoldIngot_C', 'caterium-ingot'],
    ['Recipe_IngotCaterium_C', 'caterium-ingot'],
    ['Desc_OreBauxite_C', 'bauxite'],
    ['Desc_OreGold_C', 'caterium-ore'],
    ['Desc_OreCopper_C', 'copper-ore'],
    ['Desc_RawQuartz_C', 'raw-quartz'],
    ['Desc_Stone_C', 'limestone'],
    ['Desc_OreUranium_C', 'uranium'],
    ['Desc_FluidCanister_C', 'empty-canister'],
    ['Recipe_FluidCanister_C', 'empty-canister'],
    ['Desc_CircuitBoard_C', 'circuit-board'],
    ['Recipe_CircuitBoard_C', 'circuit-board'],
    ['Desc_CopperSheet_C', 'copper-sheet'],
    ['Recipe_CopperSheet_C', 'copper-sheet'],
    ['Desc_Plastic_C', 'plastic'],
    ['Recipe_Plastic_C', 'plastic'],
    ['Desc_LiquidOil_C', 'crude-oil'],
    ['Desc_PetroleumCoke_C', 'petroleum-coke'],
    ['Recipe_PetroleumCoke_C', 'petroleum-coke'],
    ['Desc_Rubber_C', 'rubber'],
    ['Recipe_Rubber_C', 'rubber'],
    ['Desc_QuartzCrystal_C', 'quartz-crystal'],
    ['Recipe_QuartzCrystal_C', 'quartz-crystal'],
    ['Desc_Cement_C', 'concrete'],
    ['Recipe_Concrete_C', 'concrete'],
    ['Desc_SteelIngot_C', 'steel-ingot'],
    ['Recipe_IngotSteel_C', 'steel-ingot'],
    ['Desc_SteelPlate_C', 'steel-beam'],
    ['Recipe_SteelBeam_C', 'steel-beam'],
    ['Desc_SpaceElevatorPart_2_C', 'versatile-framework'],
    ['Recipe_SpaceElevatorPart_2_C', 'versatile-framework'],
    ['Desc_ModularFrame_C', 'modular-frame'],
    ['Recipe_ModularFrame_C', 'modular-frame'],
    ['Desc_Fuel_C', 'packaged-fuel'],
    ['Recipe_Fuel_C', 'packaged-fuel'],
    ['Desc_PackagedOil_C', 'packaged-oil'],
    ['Recipe_PackagedCrudeOil_C', 'packaged-oil'],
    ['Desc_PackagedOilResidue_C', 'packaged-heavy-oil-residue'],
    ['Recipe_PackagedOilResidue_C', 'packaged-heavy-oil-residue'],
    ['Desc_PackagedWater_C', 'packaged-water'],
    ['Recipe_PackagedWater_C', 'packaged-water'],
    ['Desc_CopperIngot_C', 'copper-ingot'],
    ['Recipe_IngotCopper_C', 'copper-ingot'],
    ['Desc_AluminumScrap_C', 'aluminum-scrap'],
    ['Recipe_AluminumScrap_C', 'aluminum-scrap'],
    ['Desc_AluminumCasing_C', 'aluminum-casing'],
    ['Recipe_AluminumCasing_C', 'aluminum-casing'],
    ['Desc_AluminaSolution_C', 'alumina-solution'],
    ['Recipe_AluminaSolution_C', 'alumina-solution'],
    ['Desc_SpaceElevatorPart_1_C', 'smart-plating'],
    ['Recipe_SpaceElevatorPart_1_C', 'smart-plating'],
    ['Desc_Rotor_C', 'rotor'],
    ['Recipe_Rotor_C', 'rotor'],
    ['Desc_SpaceElevatorPart_3_C', 'automated-wiring'],
    ['Recipe_SpaceElevatorPart_3_C', 'automated-wiring'],
    ['Desc_Stator_C', 'stator'],
    ['Recipe_Stator_C', 'stator'],
    ['Desc_SteelPlateReinforced_C', 'encased-industrial-beam'],
    ['Recipe_EncasedIndustrialBeam_C', 'encased-industrial-beam'],
    ['Desc_Motor_C', 'motor'],
    ['Recipe_Motor_C', 'motor'],
    ['Desc_ModularFrameHeavy_C', 'heavy-modular-frame'],
    ['Recipe_ModularFrameHeavy_C', 'heavy-modular-frame'],
    ['Desc_IronScrew_C', 'screw'],
    ['Recipe_Screw_C', 'screw'],
    ['Desc_Computer_C', 'computer'],
    ['Recipe_Computer_C', 'computer'],
    ['Desc_SpaceElevatorPart_4_C', 'modular-engine'],
    ['Recipe_SpaceElevatorPart_4_C', 'modular-engine'],
    ['Desc_SpaceElevatorPart_5_C', 'adaptive-control-unit'],
    ['Recipe_SpaceElevatorPart_5_C', 'adaptive-control-unit'],
    ['Desc_MotorLightweight_C', 'turbo-motor'],
    ['Recipe_MotorTurbo_C', 'turbo-motor'],
    ['Desc_PressureConversionCube_C', 'pressure-conversion-cube'],
    ['Recipe_PressureConversionCube_C', 'pressure-conversion-cube'],
    ['Desc_PlutoniumCell_C', 'encased-plutonium-cell'],
    ['Recipe_PlutoniumCell_C', 'encased-plutonium-cell'],
    ['Desc_PlutoniumPellet_C', 'plutonium-pellet'],
    ['Recipe_Plutonium_C', 'plutonium-pellet'],
    ['Desc_ModularFrameFused_C', 'fused-modular-frame'],
    ['Recipe_FusedModularFrame_C', 'fused-modular-frame'],
    ['Desc_ModularFrameLightweight_C', 'radio-control-unit'],
    ['Recipe_RadioControlUnit_C', 'radio-control-unit'],
    ['Desc_NonFissibleUranium_C', 'non-fissile-uranium'],
    ['Recipe_NonFissileUranium_C', 'non-fissile-uranium'],
    ['Desc_NuclearWaste_C', 'uranium-waste'],
    ['Desc_SulfuricAcid_C', 'sulfuric-acid'],
    ['Recipe_SulfuricAcid_C', 'sulfuric-acid'],
    ['Desc_CopperDust_C', 'copper-powder'],
    ['Recipe_CopperDust_C', 'copper-powder'],
    ['Desc_ElectromagneticControlRod_C', 'electromagnetic-control-rod'],
    ['Recipe_ElectromagneticControlRod_C', 'electromagnetic-control-rod'],
    ['Desc_AluminumPlateReinforced_C', 'heat-sink'],
    ['Recipe_HeatSink_C', 'heat-sink'],
    ['Desc_SpaceElevatorPart_9_C', 'nuclear-pasta'],
    ['Recipe_SpaceElevatorPart_9_C', 'nuclear-pasta'],
    ['Desc_UraniumCell_C', 'encased-uranium-cell'],
    ['Recipe_UraniumCell_C', 'encased-uranium-cell'],
    ['Desc_CoolingSystem_C', 'cooling-system'],
    ['Recipe_CoolingSystem_C', 'cooling-system'],
    ['Desc_Battery_C', 'battery'],
    ['Recipe_Battery_C', 'battery'],
    ['Desc_DissolvedSilica_C', 'dissolved-silica'],
    ['Desc_SpaceElevatorPart_8_C', 'thermal-propulsion-rocket'],
    ['Recipe_SpaceElevatorPart_8_C', 'thermal-propulsion-rocket'],
    ['Desc_Ficsonium_C', 'ficsonium'],
    ['Recipe_Ficsonium_C', 'ficsonium'],
    ['Desc_PlutoniumWaste_C', 'plutonium-waste'],
    ['Desc_SingularityCell_C', 'singularity-cell'],
    ['Recipe_SingularityCell_C', 'singularity-cell'],
    ['Desc_SpaceElevatorPart_11_C', 'ballistic-warp-drive'],
    ['Recipe_SpaceElevatorPart_11_C', 'ballistic-warp-drive'],
    ['Desc_HazmatFilter_C', 'iodine-infused-filter'],
    ['Recipe_FilterHazmat_C', 'iodine-infused-filter'],
    ['Desc_Filter_C', 'gas-filter'],
    ['Recipe_FilterGasMask_C', 'gas-filter'],
    ['Desc_AlienProtein_C', 'alien-protein'],
    ['Desc_Crystal_C', 'blue-power-slug'],
    ['Desc_AlienDNACapsule_C', 'alien-dna-capsule'],
    ['Recipe_AlienDNACapsule_C', 'alien-dna-capsule'],
    ['Desc_Crystal_mk3_C', 'purple-power-slug'],
    ['Desc_Crystal_mk2_C', 'yellow-power-slug'],
    ['Recipe_XenoZapper_C', 'xeno-zapper'],
    ['Recipe_UnpackageRocketFuel_C', 'unpackage-rocket-fuel'],
    ['Recipe_UnpackageIonizedFuel_C', 'unpackage-ionized-fuel'],
    ['Recipe_Limestone_Sulfur_C', 'sulfur-limestone'],
    ['Recipe_Iron_Limestone_C', 'limestone-iron-ore'],
    ['Recipe_Coal_Iron_C', 'iron-ore-coal'],
    ['Recipe_Coal_Limestone_C', 'limestone-coal'],
    ['Recipe_Sulfur_Coal_C', 'coal-sulfur'],
    ['Recipe_Sulfur_Iron_C', 'iron-ore-sulfur'],
    ['Recipe_Quartz_Bauxite_C', 'bauxite-raw-quartz'],
    ['Recipe_Quartz_Coal_C', 'coal-raw-quartz'],
    ['Recipe_Copper_Quartz_C', 'raw-quartz-copper-ore'],
    ['Recipe_Copper_Sulfur_C', 'sulfur-copper-ore'],
    ['Recipe_Caterium_Copper_C', 'copper-caterium-ore'],
    ['Recipe_Caterium_Quartz_C', 'raw-quartz-caterium-ore'],
    ['Recipe_Bauxite_Caterium_C', 'caterium-bauxite'],
    ['Recipe_Bauxite_Copper_C', 'copper-bauxite'],
    ['Recipe_Nitrogen_Bauxite_C', 'bauxite-nitrogen-gas'],
    ['Recipe_Nitrogen_Caterium_C', 'caterium-ore-nitrogen-gas'],
    ['Recipe_Uranium_Bauxite_C', 'bauxite-uranium'],
    ['Recipe_FicsiteIngot_AL_C', 'aluminum-ficsite-ingot'],
    ['Recipe_FicsiteIngot_CAT_C', 'caterium-ficsite-ingot'],
    ['Recipe_FicsiteIngot_Iron_C', 'iron-ficsite-ingot'],
    ['Recipe_ResidualPlastic_C', 'plastic-residual'],
    ['Recipe_ResidualRubber_C', 'rubber-residual'],
    ['Recipe_ResidualFuel_C', 'fuel-residual'],
    ['Recipe_UnpackageTurboFuel_C', 'unpackage-turbofuel'],
    ['Recipe_UnpackageWater_C', 'unpackage-water'],
    ['Recipe_UnpackageOil_C', 'unpackage-oil'],
    ['Recipe_UnpackageFuel_C', 'unpackage-fuel'],
    ['Recipe_UnpackageOilResidue_C', 'unpackage-heavy-oil-residue'],
    ['Recipe_UnpackageBioFuel_C', 'unpackage-liquid-biofuel'],
    ['Recipe_PackagedBiofuel_C', 'packaged-liquid-biofuel'],
    ['Recipe_LiquidBiofuel_C', 'liquid-biofuel'],
    ['Recipe_UnpackageAlumina_C', 'unpackage-alumina-solution'],
    ['Recipe_PackagedAlumina_C', 'packaged-alumina-solution'],
    ['Recipe_UnpackageNitricAcid_C', 'unpackage-nitric-acid'],
    ['Recipe_PackagedNitricAcid_C', 'packaged-nitric-acid'],
    ['Recipe_PlutoniumFuelRod_C', 'plutonium-fuel-rod'],
    ['Recipe_UnpackageSulfuricAcid_C', 'unpackage-sulfuric-acid'],
    ['Recipe_PackagedSulfuricAcid_C', 'packaged-sulfuric-acid'],
    ['Recipe_NuclearFuelRod_C', 'uranium-fuel-rod'],
    ['Recipe_UnpackageNitrogen_C', 'unpackage-nitrogen-gas'],
    ['Recipe_PackagedNitrogen_C', 'packaged-nitrogen-gas'],
    ['Recipe_Alternate_Silica_Distilled_C', 'silica-distilled'],
    ['Recipe_FicsoniumFuelRod_C', 'ficsonium-fuel-rod'],
    ['Recipe_XenoBasher_C', 'xeno-basher'],
    ['Recipe_Chainsaw_C', 'chainsaw'],
    ['Recipe_Biofuel_C', 'solid-biofuel'],
    ['Recipe_Protein_Hog_C', 'hog-protein'],
    ['Recipe_Protein_Spitter_C', 'spitter-protein'],
    ['Recipe_Biomass_Mycelia_C', 'biomass-mycelia'],
    ['Recipe_PowerCrystalShard_1_C', 'power-shard-1'],
    ['Recipe_ObjectScanner_C', 'object-scanner'],
    ['Recipe_Protein_Stinger_C', 'stinger-protein'],
    ['Recipe_Protein_Crab_C', 'hatcher-protein'],
    ['Recipe_Biomass_AlienProtein_C', 'biomass-alien-protein'],
    ['Recipe_RebarGun_C', 'rebar-gun'],
    ['Recipe_SpikedRebar_C', 'iron-rebar'],
    ['Recipe_CartridgeSmart_C', 'homing-rifle-ammo'],
    ['Recipe_NobeliskGas_C', 'gas-nobelisk'],
    ['Recipe_Alternate_PolyesterFabric_C', 'fabric-polyester'],
    ['Recipe_SyntheticPowerShard_C', 'power-shard-synthetic'],
    ['Recipe_PowerCrystalShard_3_C', 'power-shard-5'],
    ['Recipe_PowerCrystalShard_2_C', 'power-shard-2'],
    ['Recipe_NobeliskShockwave_C', 'pulse-nobelisk'],
    ['Recipe_NobeliskNuke_C', 'nuke-nobelisk'],
    ['Recipe_SpaceRifleMk1_C', 'rifle'],
    ['Recipe_Cartridge_C', 'rifle-cartridge'],
    ['Recipe_NobeliskDetonator_C', 'nobelisk-detonator'],
    ['Recipe_Nobelisk_C', 'nobelisk'],
    ['Recipe_PortableMiner_C', 'portable-miner'],
    ['Recipe_Biomass_Wood_C', 'biomass-wood'],
    ['Recipe_Biomass_Leaves_C', 'biomass-leaves'],
  ]);
  // reviver to convert new ids to old ids
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
  );

  const oldData: ModData = JSON.parse(fs.readFileSync(modDataPath, 'utf8'));
  const oldHash: ModHash = JSON.parse(fs.readFileSync(modHashPath, 'utf8'));

  modData.defaults = oldData.defaults;

  const updatedHash = updateModHash(modData, oldHash);

  fs.writeFileSync(modHashPath, JSON.stringify(updatedHash, null, 4));
  fs.writeFileSync(modDataPath, JSON.stringify(modData, null, 4));
}

main();
