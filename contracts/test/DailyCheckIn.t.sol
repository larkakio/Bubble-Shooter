// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DailyCheckIn} from "../src/DailyCheckIn.sol";

contract DailyCheckInTest is Test {
    DailyCheckIn public checkIn;
    address public alice = makeAddr("alice");

    function setUp() public {
        vm.warp(2 days);
        checkIn = new DailyCheckIn();
    }

    function test_checkIn_success() public {
        vm.prank(alice);
        checkIn.checkIn();
        assertEq(checkIn.lastCheckInDay(alice), block.timestamp / 1 days);
        assertEq(checkIn.streak(alice), 1);
    }

    function test_revert_same_day() public {
        vm.startPrank(alice);
        checkIn.checkIn();
        vm.expectRevert(DailyCheckIn.AlreadyCheckedInToday.selector);
        checkIn.checkIn();
        vm.stopPrank();
    }

    function test_revert_with_eth() public {
        vm.prank(alice);
        (bool ok,) = address(checkIn).call{value: 1 wei}(
            abi.encodeWithSelector(DailyCheckIn.checkIn.selector)
        );
        assertFalse(ok);
    }

    function test_streak_increments_next_day() public {
        vm.prank(alice);
        checkIn.checkIn();

        uint256 day = block.timestamp / 1 days;
        vm.warp((day + 1) * 1 days + 1);

        vm.prank(alice);
        checkIn.checkIn();
        assertEq(checkIn.streak(alice), 2);
    }

    function test_streak_resets_after_gap() public {
        vm.prank(alice);
        checkIn.checkIn();

        uint256 day = block.timestamp / 1 days;
        vm.warp((day + 2) * 1 days + 1);

        vm.prank(alice);
        checkIn.checkIn();
        assertEq(checkIn.streak(alice), 1);
    }
}
