// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract Deploy is Script {
    function run() external returns (DailyCheckIn) {
        vm.startBroadcast();
        DailyCheckIn checkIn = new DailyCheckIn();
        vm.stopBroadcast();
        return checkIn;
    }
}
