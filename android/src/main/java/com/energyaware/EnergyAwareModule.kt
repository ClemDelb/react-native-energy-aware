package com.energyaware

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class EnergyAwareModule(reactContext: ReactApplicationContext) :
  NativeEnergyAwareSpec(reactContext) {

  private val powerManager =
    reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager

  private var monitoringCount = 0
  private var batteryReceiver: BroadcastReceiver? = null
  private var powerSaveReceiver: BroadcastReceiver? = null
  private var thermalReceiver: BroadcastReceiver? = null

  // MARK: - NativeEnergyAwareSpec

  override fun getEnergyState(promise: Promise) {
    try {
      promise.resolve(buildStateMap())
    } catch (e: Exception) {
      promise.reject("ENERGY_STATE_ERROR", e.message, e)
    }
  }

  override fun startMonitoring() {
    monitoringCount++
    if (monitoringCount > 1) return

    batteryReceiver = stateChangeReceiver()
    reactApplicationContext.registerReceiver(
      batteryReceiver,
      IntentFilter(Intent.ACTION_BATTERY_CHANGED)
    )

    powerSaveReceiver = stateChangeReceiver()
    reactApplicationContext.registerReceiver(
      powerSaveReceiver,
      IntentFilter(PowerManager.ACTION_POWER_SAVE_MODE_CHANGED)
    )

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      thermalReceiver = stateChangeReceiver()
      reactApplicationContext.registerReceiver(
        thermalReceiver,
        IntentFilter(PowerManager.ACTION_THERMAL_STATUS_CHANGED)
      )
    }
  }

  override fun stopMonitoring() {
    if (monitoringCount <= 0) return
    monitoringCount--
    if (monitoringCount > 0) return

    batteryReceiver?.let {
      try {
        reactApplicationContext.unregisterReceiver(it)
      } catch (_: Exception) {
      }
    }
    batteryReceiver = null

    powerSaveReceiver?.let {
      try {
        reactApplicationContext.unregisterReceiver(it)
      } catch (_: Exception) {
      }
    }
    powerSaveReceiver = null

    thermalReceiver?.let {
      try {
        reactApplicationContext.unregisterReceiver(it)
      } catch (_: Exception) {
      }
    }
    thermalReceiver = null
  }

  // RN requires these to be implemented for NativeEventEmitter on the JS side
  override fun addListener(eventName: String) {}
  override fun removeListeners(count: Double) {}

  // MARK: - Helpers

  private fun stateChangeReceiver() = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) = emitStateChange()
  }

  private fun emitStateChange() {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("EnergyAware:stateChanged", buildStateMap())
  }

  private fun buildStateMap(): WritableMap {
    val batteryIntent = reactApplicationContext.registerReceiver(
      null,
      IntentFilter(Intent.ACTION_BATTERY_CHANGED)
    )

    val batteryLevel = batteryIntent?.let {
      val level = it.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
      val scale = it.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
      if (level >= 0 && scale > 0) level.toDouble() / scale.toDouble() else -1.0
    } ?: -1.0

    val batteryState = when (batteryIntent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1)) {
      BatteryManager.BATTERY_STATUS_CHARGING -> "charging"
      BatteryManager.BATTERY_STATUS_FULL -> "full"
      BatteryManager.BATTERY_STATUS_DISCHARGING,
      BatteryManager.BATTERY_STATUS_NOT_CHARGING -> "unplugged"

      else -> "unknown"
    }

    val thermalState = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      when (powerManager.currentThermalStatus) {
        PowerManager.THERMAL_STATUS_NONE,
        PowerManager.THERMAL_STATUS_LIGHT -> "nominal"

        PowerManager.THERMAL_STATUS_MODERATE -> "fair"
        PowerManager.THERMAL_STATUS_SEVERE -> "serious"
        PowerManager.THERMAL_STATUS_CRITICAL,
        PowerManager.THERMAL_STATUS_EMERGENCY,
        PowerManager.THERMAL_STATUS_SHUTDOWN -> "critical"

        else -> "nominal"
      }
    } else {
      "nominal"
    }

    return Arguments.createMap().apply {
      putDouble("batteryLevel", batteryLevel)
      putString("batteryState", batteryState)
      putBoolean("isLowPowerMode", powerManager.isPowerSaveMode)
      putString("thermalState", thermalState)
    }
  }

  companion object {
    const val NAME = NativeEnergyAwareSpec.NAME
  }
}
