#import "EnergyAware.h"

@implementation EnergyAware {
  NSInteger _monitoringCount;
  BOOL _hasListeners;
}

+ (NSString *)moduleName {
  return @"EnergyAware";
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

// MARK: - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents {
  return @[@"EnergyAware:stateChanged"];
}

- (void)startObserving {
  _hasListeners = YES;
}

- (void)stopObserving {
  _hasListeners = NO;
}

// MARK: - Energy state

- (NSDictionary *)currentEnergyState {
  UIDevice *device = [UIDevice currentDevice];
  NSProcessInfo *processInfo = [NSProcessInfo processInfo];

  float level = device.batteryLevel;

  NSString *batteryState;
  switch (device.batteryState) {
    case UIDeviceBatteryStateCharging:  batteryState = @"charging";  break;
    case UIDeviceBatteryStateFull:      batteryState = @"full";      break;
    case UIDeviceBatteryStateUnplugged: batteryState = @"unplugged"; break;
    default:                            batteryState = @"unknown";   break;
  }

  NSString *thermalState;
  switch (processInfo.thermalState) {
    case NSProcessInfoThermalStateNominal:  thermalState = @"nominal";  break;
    case NSProcessInfoThermalStateFair:     thermalState = @"fair";     break;
    case NSProcessInfoThermalStateSerious:  thermalState = @"serious";  break;
    case NSProcessInfoThermalStateCritical: thermalState = @"critical"; break;
    default:                                thermalState = @"nominal";  break;
  }

  return @{
    @"batteryLevel":   @(level),
    @"batteryState":   batteryState,
    @"isLowPowerMode": @(processInfo.isLowPowerModeEnabled),
    @"thermalState":   thermalState,
  };
}

// MARK: - NativeEnergyAwareSpec

- (void)getEnergyState:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  resolve([self currentEnergyState]);
}

- (void)startMonitoring {
  _monitoringCount++;
  if (_monitoringCount > 1) return;

  [UIDevice currentDevice].batteryMonitoringEnabled = YES;

  NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
  SEL handler = @selector(handleStateChange);

  [nc addObserver:self selector:handler name:UIDeviceBatteryLevelDidChangeNotification object:nil];
  [nc addObserver:self selector:handler name:UIDeviceBatteryStateDidChangeNotification object:nil];
  [nc addObserver:self selector:handler name:NSProcessInfoPowerStateDidChangeNotification object:nil];
  [nc addObserver:self selector:handler name:NSProcessInfoThermalStateDidChangeNotification object:nil];
}

- (void)stopMonitoring {
  if (_monitoringCount <= 0) return;
  _monitoringCount--;
  if (_monitoringCount > 0) return;

  [UIDevice currentDevice].batteryMonitoringEnabled = NO;
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handleStateChange {
  if (!_hasListeners) return;
  [self sendEventWithName:@"EnergyAware:stateChanged" body:[self currentEnergyState]];
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

// MARK: - TurboModule

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeEnergyAwareSpecJSI>(params);
}

@end
