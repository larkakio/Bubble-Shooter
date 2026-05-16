// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DailyCheckIn — once per UTC calendar day, no ETH required
contract DailyCheckIn {
    event CheckedIn(address indexed user, uint256 day, uint256 streak);

    error AlreadyCheckedInToday();
    error EthNotAccepted();

    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    function checkIn() external payable {
        if (msg.value != 0) revert EthNotAccepted();

        uint256 today = block.timestamp / 1 days;
        uint256 lastDay = lastCheckInDay[msg.sender];
        if (lastDay == today) revert AlreadyCheckedInToday();

        uint256 newStreak = 1;
        if (lastDay != 0 && today == lastDay + 1) {
            newStreak = streak[msg.sender] + 1;
        }

        lastCheckInDay[msg.sender] = today;
        streak[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, today, newStreak);
    }
}
