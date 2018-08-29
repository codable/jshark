'use strict';

let SPINEL_PROP_LAST_STATUS      = 0;  ///< status [i]
let SPINEL_PROP_PROTOCOL_VERSION = 1;  ///< major; minor [i;i]
let SPINEL_PROP_NCP_VERSION      = 2;  ///< version string [U]
let SPINEL_PROP_INTERFACE_TYPE   = 3;  ///< [i]
let SPINEL_PROP_VENDOR_ID        = 4;  ///< [i]
let SPINEL_PROP_CAPS             = 5;  ///< capability list [A(i)]
let SPINEL_PROP_INTERFACE_COUNT  = 6;  ///< Interface count [C]
let SPINEL_PROP_POWER_STATE      = 7;  ///< PowerState [C] (deprecated; use `MCU_POWER_STATE` instead).
let SPINEL_PROP_HWADDR           = 8;  ///< PermEUI64 [E]
let SPINEL_PROP_LOCK             = 9;  ///< PropLock [b]
let SPINEL_PROP_HBO_MEM_MAX      = 10; ///< Max offload mem [S]
let SPINEL_PROP_HBO_BLOCK_MAX    = 11; ///< Max offload block [S]
let SPINEL_PROP_HOST_POWER_STATE = 12; ///< Host MCU power state [C]
let SPINEL_PROP_MCU_POWER_STATE  = 13; ///< NCP's MCU power state [c]

let SPINEL_PROP_BASE_EXT__BEGIN = 0x1000;

/// GPIO Configuration
/** Format= `A(CCU)`
 *  Type= Read-Only (Optionally Read-write using `CMD_PROP_VALUE_INSERT`)
 *
 * An array of structures which contain the following fields=
 *
 * *   `C`= GPIO Number
 * *   `C`= GPIO Configuration Flags
 * *   `U`= Human-readable GPIO name
 *
 * GPIOs which do not have a corresponding entry are not supported.
 *
 * The configuration parameter contains the configuration flags for the
 * GPIO=
 *
 *       0   1   2   3   4   5   6   7
 *     +---+---+---+---+---+---+---+---+
 *     |DIR|PUP|PDN|TRIGGER|  RESERVED |
 *     +---+---+---+---+---+---+---+---+
 *             |O/D|
 *             +---+
 *
 * *   `DIR`= Pin direction. Clear (0) for input; set (1) for output.
 * *   `PUP`= Pull-up enabled flag.
 * *   `PDN`/`O/D`= Flag meaning depends on pin direction=
 *     *   Input= Pull-down enabled.
 *     *   Output= Output is an open-drain.
 * *   `TRIGGER`= Enumeration describing how pin changes generate
 *     asynchronous notification commands (TBD) from the NCP to the host.
 *     *   0= Feature disabled for this pin
 *     *   1= Trigger on falling edge
 *     *   2= Trigger on rising edge
 *     *   3= Trigger on level change
 * *   `RESERVED`= Bits reserved for future use. Always cleared to zero
 *     and ignored when read.
 *
 * As an optional feature; the configuration of individual pins may be
 * modified using the `CMD_PROP_VALUE_INSERT` command. Only the GPIO
 * number and flags fields MUST be present; the GPIO name (if present)
 * would be ignored. This command can only be used to modify the
 * configuration of GPIOs which are already exposed---it cannot be used
 * by the host to add additional GPIOs.
 */
let SPINEL_PROP_GPIO_CONFIG = SPINEL_PROP_BASE_EXT__BEGIN + 0;

/// GPIO State Bitmask
/** Format= `D`
 *  Type= Read-Write
 *
 * Contains a bit field identifying the state of the GPIOs. The length of
 * the data associated with these properties depends on the number of
 * GPIOs. If you have 10 GPIOs; you'd have two bytes. GPIOs are numbered
 * from most significant bit to least significant bit; so 0x80 is GPIO 0;
 * 0x40 is GPIO 1; etc.
 *
 * For GPIOs configured as inputs=
 *
 * *   `CMD_PROP_VAUE_GET`= The value of the associated bit describes the
 *     logic level read from the pin.
 * *   `CMD_PROP_VALUE_SET`= The value of the associated bit is ignored
 *     for these pins.
 *
 * For GPIOs configured as outputs=
 *
 * *   `CMD_PROP_VAUE_GET`= The value of the associated bit is
 *     implementation specific.
 * *   `CMD_PROP_VALUE_SET`= The value of the associated bit determines
 *     the new logic level of the output. If this pin is configured as an
 *     open-drain; setting the associated bit to 1 will cause the pin to
 *     enter a Hi-Z state.
 *
 * For GPIOs which are not specified in `PROP_GPIO_CONFIG`=
 *
 * *   `CMD_PROP_VAUE_GET`= The value of the associated bit is
 *     implementation specific.
 * *   `CMD_PROP_VALUE_SET`= The value of the associated bit MUST be
 *     ignored by the NCP.
 *
 * When writing; unspecified bits are assumed to be zero.
 */
let SPINEL_PROP_GPIO_STATE = SPINEL_PROP_BASE_EXT__BEGIN + 2;

/// GPIO State Set-Only Bitmask
/** Format= `D`
 *  Type= Write-Only
 *
 * Allows for the state of various output GPIOs to be set without affecting
 * other GPIO states. Contains a bit field identifying the output GPIOs that
 * should have their state set to 1.
 *
 * When writing; unspecified bits are assumed to be zero. The value of
 * any bits for GPIOs which are not specified in `PROP_GPIO_CONFIG` MUST
 * be ignored.
 */
let SPINEL_PROP_GPIO_STATE_SET = SPINEL_PROP_BASE_EXT__BEGIN + 3;

/// GPIO State Clear-Only Bitmask
/** Format= `D`
 *  Type= Write-Only
 *
 * Allows for the state of various output GPIOs to be cleared without affecting
 * other GPIO states. Contains a bit field identifying the output GPIOs that
 * should have their state cleared to 0.
 *
 * When writing; unspecified bits are assumed to be zero. The value of
 * any bits for GPIOs which are not specified in `PROP_GPIO_CONFIG` MUST
 * be ignored.
 */
let SPINEL_PROP_GPIO_STATE_CLEAR = SPINEL_PROP_BASE_EXT__BEGIN + 4;

/// 32-bit random number from TRNG; ready-to-use.
let SPINEL_PROP_TRNG_32 = SPINEL_PROP_BASE_EXT__BEGIN + 5;

/// 16 random bytes from TRNG; ready-to-use.
let SPINEL_PROP_TRNG_128 = SPINEL_PROP_BASE_EXT__BEGIN + 6;

/// Raw samples from TRNG entropy source representing 32 bits of entropy.
let SPINEL_PROP_TRNG_RAW_32 = SPINEL_PROP_BASE_EXT__BEGIN + 7;

/// NCP Unsolicited update filter
/** Format= `A(I)`
 *  Type= Read-Write (optional Insert-Remove)
 *  Required capability= `CAP_UNSOL_UPDATE_FILTER`
 *
 * Contains a list of properties which are excluded from generating
 * unsolicited value updates. This property is empty after reset.
 * In other words; the host may opt-out of unsolicited property updates
 * for a specific property by adding that property id to this list.
 * Hosts SHOULD NOT add properties to this list which are not
 * present in `PROP_UNSOL_UPDATE_LIST`. If such properties are added;
 * the NCP ignores the unsupported properties.
 */
let SPINEL_PROP_UNSOL_UPDATE_FILTER = SPINEL_PROP_BASE_EXT__BEGIN + 8;

/// List of properties capable of generating unsolicited value update.
/** Format= `A(I)`
 *  Type= Read-Only
 *  Required capability= `CAP_UNSOL_UPDATE_FILTER`
 *
 * Contains a list of properties which are capable of generating
 * unsolicited value updates. This list can be used when populating
 * `PROP_UNSOL_UPDATE_FILTER` to disable all unsolicited property
 * updates.
 *
 * This property is intended to effectively behave as a constant
 * for a given NCP firmware.
 */
let SPINEL_PROP_UNSOL_UPDATE_LIST = SPINEL_PROP_BASE_EXT__BEGIN + 9;

let SPINEL_PROP_BASE_EXT__END = 0x1100;

let SPINEL_PROP_PHY__BEGIN         = 0x20;
let SPINEL_PROP_PHY_ENABLED        = SPINEL_PROP_PHY__BEGIN + 0; ///< [b]
let SPINEL_PROP_PHY_CHAN           = SPINEL_PROP_PHY__BEGIN + 1; ///< [C]
let SPINEL_PROP_PHY_CHAN_SUPPORTED = SPINEL_PROP_PHY__BEGIN + 2; ///< [A(C)]
let SPINEL_PROP_PHY_FREQ           = SPINEL_PROP_PHY__BEGIN + 3; ///< kHz [L]
let SPINEL_PROP_PHY_CCA_THRESHOLD  = SPINEL_PROP_PHY__BEGIN + 4; ///< dBm [c]
let SPINEL_PROP_PHY_TX_POWER       = SPINEL_PROP_PHY__BEGIN + 5; ///< [c]
let SPINEL_PROP_PHY_RSSI           = SPINEL_PROP_PHY__BEGIN + 6; ///< dBm [c]
let SPINEL_PROP_PHY_RX_SENSITIVITY = SPINEL_PROP_PHY__BEGIN + 7; ///< dBm [c]
let SPINEL_PROP_PHY__END           = 0x30;

let SPINEL_PROP_PHY_EXT__BEGIN = 0x1200;

/// Signal Jamming Detection Enable
/** Format= `b`
 *
 * Indicates if jamming detection is enabled or disabled. Set to true
 * to enable jamming detection.
 */
let SPINEL_PROP_JAM_DETECT_ENABLE = SPINEL_PROP_PHY_EXT__BEGIN + 0;

/// Signal Jamming Detected Indicator
/** Format= `b` (Read-Only)
 *
 * Set to true if radio jamming is detected. Set to false otherwise.
 *
 * When jamming detection is enabled; changes to the value of this
 * property are emitted asynchronously via `CMD_PROP_VALUE_IS`.
 */
let SPINEL_PROP_JAM_DETECTED = SPINEL_PROP_PHY_EXT__BEGIN + 1;

/// Jamming detection RSSI threshold
/** Format= `c`
 *  Units= dBm
 *
 * This parameter describes the threshold RSSI level (measured in
 * dBm) above which the jamming detection will consider the
 * channel blocked.
 */
let SPINEL_PROP_JAM_DETECT_RSSI_THRESHOLD = SPINEL_PROP_PHY_EXT__BEGIN + 2;

/// Jamming detection window size
/** Format= `C`
 *  Units= Seconds (1-63)
 *
 * This parameter describes the window period for signal jamming
 * detection.
 */
let SPINEL_PROP_JAM_DETECT_WINDOW = SPINEL_PROP_PHY_EXT__BEGIN + 3;

/// Jamming detection busy period
/** Format= `C`
 *  Units= Seconds (1-63)
 *
 * This parameter describes the number of aggregate seconds within
 * the detection window where the RSSI must be above
 * `PROP_JAM_DETECT_RSSI_THRESHOLD` to trigger detection.
 *
 * The behavior of the jamming detection feature when `PROP_JAM_DETECT_BUSY`
 * is larger than `PROP_JAM_DETECT_WINDOW` is undefined.
 */
let SPINEL_PROP_JAM_DETECT_BUSY = SPINEL_PROP_PHY_EXT__BEGIN + 4;

/// Jamming detection history bitmap (for debugging)
/** Format= `X` (read-only)
 *
 * This value provides information about current state of jamming detection
 * module for monitoring/debugging purpose. It returns a 64-bit value where
 * each bit corresponds to one second interval starting with bit 0 for the
 * most recent interval and bit 63 for the oldest intervals (63 sec earlier).
 * The bit is set to 1 if the jamming detection module observed/detected
 * high signal level during the corresponding one second interval.
 *
 */
let SPINEL_PROP_JAM_DETECT_HISTORY_BITMAP = SPINEL_PROP_PHY_EXT__BEGIN + 5;

/// Channel monitoring sample interval
/** Format= `L` (read-only)
 *  Units= Milliseconds
 *
 * Required capability= SPINEL_CAP_CHANNEL_MONITOR
 *
 * If channel monitoring is enabled and active; every sample interval; a
 * zero-duration Energy Scan is performed; collecting a single RSSI sample
 * per channel. The RSSI samples are compared with a pre-specified RSSI
 * threshold.
 *
 */
let SPINEL_PROP_CHANNEL_MONITOR_SAMPLE_INTERVAL = SPINEL_PROP_PHY_EXT__BEGIN + 6;

/// Channel monitoring RSSI threshold
/** Format= `c` (read-only)
 *  Units= dBm
 *
 * Required capability= SPINEL_CAP_CHANNEL_MONITOR
 *
 * This value specifies the threshold used by channel monitoring module.
 * Channel monitoring maintains the average rate of RSSI samples that
 * are above the threshold within (approximately) a pre-specified number
 * of samples (sample window).
 *
 */
let SPINEL_PROP_CHANNEL_MONITOR_RSSI_THRESHOLD = SPINEL_PROP_PHY_EXT__BEGIN + 7;

/// Channel monitoring sample window
/** Format= `L` (read-only)
 *  Units= Number of samples
 *
 * Required capability= SPINEL_CAP_CHANNEL_MONITOR
 *
 * The averaging sample window length (in units of number of channel
 * samples) used by channel monitoring module. Channel monitoring will
 * sample all channels every sample interval. It maintains the average rate
 * of RSSI samples that are above the RSSI threshold within (approximately)
 * the sample window.
 *
 */
let SPINEL_PROP_CHANNEL_MONITOR_SAMPLE_WINDOW = SPINEL_PROP_PHY_EXT__BEGIN + 8;

/// Channel monitoring sample count
/** Format= `L` (read-only)
 *  Units= Number of samples
 *
 * Required capability= SPINEL_CAP_CHANNEL_MONITOR
 *
 * Total number of RSSI samples (per channel) taken by the channel
 * monitoring module since its start (since Thread network interface
 * was enabled).
 *
 */
let SPINEL_PROP_CHANNEL_MONITOR_SAMPLE_COUNT = SPINEL_PROP_PHY_EXT__BEGIN + 9;

/// Channel monitoring channel occupancy
/** Format= `A(t(CU))` (read-only)
 *
 * Required capability= SPINEL_CAP_CHANNEL_MONITOR
 *
 * Data per item is=
 *
 *  `C`= Channel
 *  `U`= Channel occupancy indicator
 *
 * The channel occupancy value represents the average rate/percentage of
 * RSSI samples that were above RSSI threshold ("bad" RSSI samples) within
 * (approximately) sample window latest RSSI samples.
 *
 * Max value of `0xffff` indicates all RSSI samples were above RSSI
 * threshold (i.e. 100% of samples were "bad").
 *
 */
let SPINEL_PROP_CHANNEL_MONITOR_CHANNEL_OCCUPANCY = SPINEL_PROP_PHY_EXT__BEGIN + 10;

let SPINEL_PROP_PHY_EXT__END = 0x1300;

let SPINEL_PROP_MAC__BEGIN             = 0x30;
let SPINEL_PROP_MAC_SCAN_STATE         = SPINEL_PROP_MAC__BEGIN + 0;  ///< [C]
let SPINEL_PROP_MAC_SCAN_MASK          = SPINEL_PROP_MAC__BEGIN + 1;  ///< [A(C)]
let SPINEL_PROP_MAC_SCAN_PERIOD        = SPINEL_PROP_MAC__BEGIN + 2;  ///< ms-per-channel [S]
let SPINEL_PROP_MAC_SCAN_BEACON        = SPINEL_PROP_MAC__BEGIN + 3;  ///< chan;rssi;mac_data;net_data [CcdD]
let SPINEL_PROP_MAC_15_4_LADDR         = SPINEL_PROP_MAC__BEGIN + 4;  ///< [E]
let SPINEL_PROP_MAC_15_4_SADDR         = SPINEL_PROP_MAC__BEGIN + 5;  ///< [S]
let SPINEL_PROP_MAC_15_4_PANID         = SPINEL_PROP_MAC__BEGIN + 6;  ///< [S]
let SPINEL_PROP_MAC_RAW_STREAM_ENABLED = SPINEL_PROP_MAC__BEGIN + 7;  ///< [C]
let SPINEL_PROP_MAC_PROMISCUOUS_MODE   = SPINEL_PROP_MAC__BEGIN + 8;  ///< [C]
let SPINEL_PROP_MAC_ENERGY_SCAN_RESULT = SPINEL_PROP_MAC__BEGIN + 9;  ///< chan;maxRssi [Cc]
let SPINEL_PROP_MAC_DATA_POLL_PERIOD   = SPINEL_PROP_MAC__BEGIN + 10; ///< pollPeriod (in ms) [L]
let SPINEL_PROP_MAC__END               = 0x40;

let SPINEL_PROP_MAC_EXT__BEGIN = 0x1300;
/// MAC Whitelist
/** Format= `A(t(Ec))`
 *
 * Structure Parameters=
 *
 * * `E`= EUI64 address of node
 * * `c`= Optional fixed RSSI. 127 means not set.
 */
let SPINEL_PROP_MAC_WHITELIST = SPINEL_PROP_MAC_EXT__BEGIN + 0;

/// MAC Whitelist Enabled Flag
/** Format= `b`
 */
let SPINEL_PROP_MAC_WHITELIST_ENABLED = SPINEL_PROP_MAC_EXT__BEGIN + 1;

/// MAC Extended Address
/** Format= `E`
 *
 *  Specified by Thread. Randomly-chosen; but non-volatile EUI-64.
 */
let SPINEL_PROP_MAC_EXTENDED_ADDR = SPINEL_PROP_MAC_EXT__BEGIN + 2;

/// MAC Source Match Enabled Flag
/** Format= `b`
 */
let SPINEL_PROP_MAC_SRC_MATCH_ENABLED = SPINEL_PROP_MAC_EXT__BEGIN + 3;

/// MAC Source Match Short Address List
/** Format= `A(S)`
 */
let SPINEL_PROP_MAC_SRC_MATCH_SHORT_ADDRESSES = SPINEL_PROP_MAC_EXT__BEGIN + 4;

/// MAC Source Match Extended Address List
/** Format= `A(E)`
 */
let SPINEL_PROP_MAC_SRC_MATCH_EXTENDED_ADDRESSES = SPINEL_PROP_MAC_EXT__BEGIN + 5;

/// MAC Blacklist
/** Format= `A(t(E))`
 *
 * Structure Parameters=
 *
 * * `E`= EUI64 address of node
 */
let SPINEL_PROP_MAC_BLACKLIST = SPINEL_PROP_MAC_EXT__BEGIN + 6;

/// MAC Blacklist Enabled Flag
/** Format= `b`
 */
let SPINEL_PROP_MAC_BLACKLIST_ENABLED = SPINEL_PROP_MAC_EXT__BEGIN + 7;

/// MAC Received Signal Strength Filter
/** Format= `A(t(Ec))`
 *
 * Structure Parameters=
 *
 * * `E`= Optional EUI64 address of node. Set default RSS if not included.
 * * `c`= Fixed RSS. OT_MAC_FILTER_FIXED_RSS_OVERRIDE_DISABLED(127) means not set.
 */
let SPINEL_PROP_MAC_FIXED_RSS = SPINEL_PROP_MAC_EXT__BEGIN + 8;

/// The CCA failure rate
/** Format= `S`
 *
 * This property provides the current CCA (Clear Channel Assessment) failure rate.
 *
 * Maximum value `0xffff` corresponding to 100% failure rate.
 *
 */
let SPINEL_PROP_MAC_CCA_FAILURE_RATE = SPINEL_PROP_MAC_EXT__BEGIN + 9;

let SPINEL_PROP_MAC_EXT__END = 0x1400;

let SPINEL_PROP_NET__BEGIN               = 0x40;
let SPINEL_PROP_NET_SAVED                = SPINEL_PROP_NET__BEGIN + 0; ///< [b]
let SPINEL_PROP_NET_IF_UP                = SPINEL_PROP_NET__BEGIN + 1; ///< [b]
let SPINEL_PROP_NET_STACK_UP             = SPINEL_PROP_NET__BEGIN + 2; ///< [b]
let SPINEL_PROP_NET_ROLE                 = SPINEL_PROP_NET__BEGIN + 3; ///< [C]
let SPINEL_PROP_NET_NETWORK_NAME         = SPINEL_PROP_NET__BEGIN + 4; ///< [U]
let SPINEL_PROP_NET_XPANID               = SPINEL_PROP_NET__BEGIN + 5; ///< [D]
let SPINEL_PROP_NET_MASTER_KEY           = SPINEL_PROP_NET__BEGIN + 6; ///< [D]
let SPINEL_PROP_NET_KEY_SEQUENCE_COUNTER = SPINEL_PROP_NET__BEGIN + 7; ///< [L]
let SPINEL_PROP_NET_PARTITION_ID         = SPINEL_PROP_NET__BEGIN + 8; ///< [L]

/// Require Join Existing
/** Format= `b`
 *  Default Value= `false`
 *
 * This flag is typically used for nodes that are associating with an
 * existing network for the first time. If this is set to `true` before
 * `PROP_NET_STACK_UP` is set to `true`; the
 * creation of a new partition at association is prevented. If the node
 * cannot associate with an existing partition; `PROP_LAST_STATUS` will
 * emit a status that indicates why the association failed and
 * `PROP_NET_STACK_UP` will automatically revert to `false`.
 *
 * Once associated with an existing partition; this flag automatically
 * reverts to `false`.
 *
 * The behavior of this property being set to `true` when
 * `PROP_NET_STACK_UP` is already set to `true` is undefined.
 */
let SPINEL_PROP_NET_REQUIRE_JOIN_EXISTING = SPINEL_PROP_NET__BEGIN + 9;

let SPINEL_PROP_NET_KEY_SWITCH_GUARDTIME = SPINEL_PROP_NET__BEGIN + 10; ///< [L]

let SPINEL_PROP_NET_PSKC = SPINEL_PROP_NET__BEGIN + 11; ///< [D]

let SPINEL_PROP_NET__END = 0x50;

let SPINEL_PROP_NET_EXT__BEGIN = 0x1400;
let SPINEL_PROP_NET_EXT__END   = 0x1500;

let SPINEL_PROP_THREAD__BEGIN      = 0x50;
let SPINEL_PROP_THREAD_LEADER_ADDR = SPINEL_PROP_THREAD__BEGIN + 0; ///< [6]

/// Thread Parent Info
/** Format= `ESLccCC` - Read only
 *
 *  `E`= Extended address
 *  `S`= RLOC16
 *  `L`= Age (seconds since last heard from)
 *  `c`= Average RSS (in dBm)
 *  `c`= Last RSSI (in dBm)
 *  `C`= Link Quality In
 *  `C`= Link Quality Out
 *
 */
let SPINEL_PROP_THREAD_PARENT = SPINEL_PROP_THREAD__BEGIN + 1;

/// Thread Child Table
/** Format= [A(t(ESLLCCcCc)] - Read only
 *
 * Data per item is=
 *
 *  `E`= Extended address
 *  `S`= RLOC16
 *  `L`= Timeout (in seconds)
 *  `L`= Age (in seconds)
 *  `L`= Network Data version
 *  `C`= Link Quality In
 *  `c`= Average RSS (in dBm)
 *  `C`= Mode (bit-flags)
 *  `c`= Last RSSI (in dBm)
 *
 */
let SPINEL_PROP_THREAD_CHILD_TABLE                 = SPINEL_PROP_THREAD__BEGIN + 2;
let SPINEL_PROP_THREAD_LEADER_RID                  = SPINEL_PROP_THREAD__BEGIN + 3; ///< [C]
let SPINEL_PROP_THREAD_LEADER_WEIGHT               = SPINEL_PROP_THREAD__BEGIN + 4; ///< [C]
let SPINEL_PROP_THREAD_LOCAL_LEADER_WEIGHT         = SPINEL_PROP_THREAD__BEGIN + 5; ///< [C]
let SPINEL_PROP_THREAD_NETWORK_DATA                = SPINEL_PROP_THREAD__BEGIN + 6; ///< [D]
let SPINEL_PROP_THREAD_NETWORK_DATA_VERSION        = SPINEL_PROP_THREAD__BEGIN + 7; ///< [S]
let SPINEL_PROP_THREAD_STABLE_NETWORK_DATA         = SPINEL_PROP_THREAD__BEGIN + 8; ///< [D]
let SPINEL_PROP_THREAD_STABLE_NETWORK_DATA_VERSION = SPINEL_PROP_THREAD__BEGIN + 9; ///< [S]

/// On-Mesh Prefixes
/** Format= `A(t(6CbCbS))`
 *
 * Data per item is=
 *
 *  `6`= IPv6 Prefix
 *  `C`= Prefix length in bits
 *  `b`= Stable flag
 *  `C`= TLV flags
 *  `b`= "Is defined locally" flag. Set if this network was locally
 *       defined. Assumed to be true for set; insert and replace. Clear if
 *       the on mesh network was defined by another node.
 *  `S`= The RLOC16 of the device that registered this on-mesh prefix entry.
 *       This value is not used and ignored when adding an on-mesh prefix.
 *
 */
let SPINEL_PROP_THREAD_ON_MESH_NETS = SPINEL_PROP_THREAD__BEGIN + 10;

/// Off-mesh routes
/** Format= [A(t(6CbCbb))]
 *
 * Data per item is=
 *
 *  `6`= Route Prefix
 *  `C`= Prefix length in bits
 *  `b`= Stable flag
 *  `C`= Route preference flags
 *  `b`= "Is defined locally" flag. Set if this route info was locally
 *       defined as part of local network data. Assumed to be true for set;
 *       insert and replace. Clear if the route is part of partition's network
 *       data.
 *  `b`= "Next hop is this device" flag. Set if the next hop for the
 *       route is this device itself (i.e.; route was added by this device)
 *       This value is ignored when adding an external route. For any added
 *       route the next hop is this device.
 *  `S`= The RLOC16 of the device that registered this route entry.
 *       This value is not used and ignored when adding a route.
 *
 */
let SPINEL_PROP_THREAD_OFF_MESH_ROUTES = SPINEL_PROP_THREAD__BEGIN + 11;

let SPINEL_PROP_THREAD_ASSISTING_PORTS             = SPINEL_PROP_THREAD__BEGIN + 12; ///< array(portn) [A(S)]
let SPINEL_PROP_THREAD_ALLOW_LOCAL_NET_DATA_CHANGE = SPINEL_PROP_THREAD__BEGIN + 13; ///< [b]

/// Thread Mode
/** Format= `C`
 *
 *  This property contains the value of the mode
 *  TLV for this node. The meaning of the bits in this
 *  bitfield are defined by section 4.5.2 of the Thread
 *  specification.
 */
let SPINEL_PROP_THREAD_MODE = SPINEL_PROP_THREAD__BEGIN + 14;
let SPINEL_PROP_THREAD__END = 0x60;

let SPINEL_PROP_THREAD_EXT__BEGIN = 0x1500;

/// Thread Child Timeout
/** Format= `L`
 *
 *  Used when operating in the Child role.
 */
let SPINEL_PROP_THREAD_CHILD_TIMEOUT = SPINEL_PROP_THREAD_EXT__BEGIN + 0;

/// Thread RLOC16
/** Format= `S`
 */
let SPINEL_PROP_THREAD_RLOC16 = SPINEL_PROP_THREAD_EXT__BEGIN + 1;

/// Thread Router Upgrade Threshold
/** Format= `C`
 */
let SPINEL_PROP_THREAD_ROUTER_UPGRADE_THRESHOLD = SPINEL_PROP_THREAD_EXT__BEGIN + 2;

/// Thread Context Reuse Delay
/** Format= `L`
 */
let SPINEL_PROP_THREAD_CONTEXT_REUSE_DELAY = SPINEL_PROP_THREAD_EXT__BEGIN + 3;

/// Thread Network ID Timeout
/** Format= `C`
 */
let SPINEL_PROP_THREAD_NETWORK_ID_TIMEOUT = SPINEL_PROP_THREAD_EXT__BEGIN + 4;

/// List of active thread router ids
/** Format= `A(C)`
 *
 * Note that some implementations may not support CMD_GET_VALUE
 * routerids; but may support CMD_REMOVE_VALUE when the node is
 * a leader.
 */
let SPINEL_PROP_THREAD_ACTIVE_ROUTER_IDS = SPINEL_PROP_THREAD_EXT__BEGIN + 5;

/// Forward IPv6 packets that use RLOC16 addresses to HOST.
/** Format= `b`
 */
let SPINEL_PROP_THREAD_RLOC16_DEBUG_PASSTHRU = SPINEL_PROP_THREAD_EXT__BEGIN + 6;

/// This property indicates whether or not the `Router Role` is enabled.
/** Format `b`
 */
let SPINEL_PROP_THREAD_ROUTER_ROLE_ENABLED = SPINEL_PROP_THREAD_EXT__BEGIN + 7;

/// Thread Router Downgrade Threshold
/** Format= `C`
 */
let SPINEL_PROP_THREAD_ROUTER_DOWNGRADE_THRESHOLD = SPINEL_PROP_THREAD_EXT__BEGIN + 8;

/// Thread Router Selection Jitter
/** Format= `C`
 */
let SPINEL_PROP_THREAD_ROUTER_SELECTION_JITTER = SPINEL_PROP_THREAD_EXT__BEGIN + 9;

/// Thread Preferred Router Id
/** Format= `C` - Write only
 */
let SPINEL_PROP_THREAD_PREFERRED_ROUTER_ID = SPINEL_PROP_THREAD_EXT__BEGIN + 10;

/// Thread Neighbor Table
/** Format= `A(t(ESLCcCbLLc))` - Read only
 *
 * Data per item is=
 *
 *  `E`= Extended address
 *  `S`= RLOC16
 *  `L`= Age (in seconds)
 *  `C`= Link Quality In
 *  `c`= Average RSS (in dBm)
 *  `C`= Mode (bit-flags)
 *  `b`= `true` if neighbor is a child; `false` otherwise.
 *  `L`= Link Frame Counter
 *  `L`= MLE Frame Counter
 *  `c`= The last RSSI (in dBm)
 *
 */
let SPINEL_PROP_THREAD_NEIGHBOR_TABLE = SPINEL_PROP_THREAD_EXT__BEGIN + 11;

/// Thread Max Child Count
/** Format= `C`
 */
let SPINEL_PROP_THREAD_CHILD_COUNT_MAX = SPINEL_PROP_THREAD_EXT__BEGIN + 12;

/// Leader network data
/** Format= `D` - Read only
 */
let SPINEL_PROP_THREAD_LEADER_NETWORK_DATA = SPINEL_PROP_THREAD_EXT__BEGIN + 13;

/// Stable leader network data
/** Format= `D` - Read only
 */
let SPINEL_PROP_THREAD_STABLE_LEADER_NETWORK_DATA = SPINEL_PROP_THREAD_EXT__BEGIN + 14;

/// Thread joiner data
/** Format `A(T(ULE))`
 *  PSKd; joiner timeout; eui64 (optional)
 *
 * This property is being deprecated by SPINEL_PROP_MESHCOP_COMMISSIONER_JOINERS.
 *
 */
let SPINEL_PROP_THREAD_JOINERS = SPINEL_PROP_THREAD_EXT__BEGIN + 15;

/// Thread commissioner enable
/** Format `b`
 *
 * Default value is `false`.
 *
 * This property is being deprecated by SPINEL_PROP_MESHCOP_COMMISSIONER_STATE.
 *
 */
let SPINEL_PROP_THREAD_COMMISSIONER_ENABLED = SPINEL_PROP_THREAD_EXT__BEGIN + 16;

/// Thread TMF proxy enable
/** Format `b`
 * Required capability= `SPINEL_CAP_THREAD_TMF_PROXY`
 *
 * This property is deprecated.
 *
 */
let SPINEL_PROP_THREAD_TMF_PROXY_ENABLED = SPINEL_PROP_THREAD_EXT__BEGIN + 17;

/// Thread TMF proxy stream
/** Format `dSS`
 * Required capability= `SPINEL_CAP_THREAD_TMF_PROXY`
 *
 * This property is deprecated. Please see `SPINEL_PROP_THREAD_UDP_PROXY_STREAM`.
 *
 */
let SPINEL_PROP_THREAD_TMF_PROXY_STREAM = SPINEL_PROP_THREAD_EXT__BEGIN + 18;

/// Thread "joiner" flag used during discovery scan operation
/** Format `b`
 *
 * This property defines the Joiner Flag value in the Discovery Request TLV.
 *
 * Default value is `false`.
 */
let SPINEL_PROP_THREAD_DISCOVERY_SCAN_JOINER_FLAG = SPINEL_PROP_THREAD_EXT__BEGIN + 19;

/// Enable EUI64 filtering for discovery scan operation.
/** Format `b`
 *
 * Default value is `false`
 */
let SPINEL_PROP_THREAD_DISCOVERY_SCAN_ENABLE_FILTERING = SPINEL_PROP_THREAD_EXT__BEGIN + 20;

/// PANID used for Discovery scan operation (used for PANID filtering).
/** Format= `S`
 *
 * Default value is 0xffff (Broadcast PAN) to disable PANID filtering
 *
 */
let SPINEL_PROP_THREAD_DISCOVERY_SCAN_PANID = SPINEL_PROP_THREAD_EXT__BEGIN + 21;

/// Thread (out of band) steering data for MLE Discovery Response.
/** Format `E` - Write only
 *
 * Required capability= SPINEL_CAP_OOB_STEERING_DATA.
 *
 * Writing to this property allows to set/update the MLE Discovery Response steering data out of band.
 *
 *  - All zeros to clear the steering data (indicating that there is no steering data).
 *  - All 0xFFs to set steering data/bloom filter to accept/allow all.
 *  - A specific EUI64 which is then added to current steering data/bloom filter.
 *
 */
let SPINEL_PROP_THREAD_STEERING_DATA = SPINEL_PROP_THREAD_EXT__BEGIN + 22;

/// Thread Router Table.
/** Format= `A(t(ESCCCCCCb)` - Read only
 *
 * Data per item is=
 *
 *  `E`= IEEE 802.15.4 Extended Address
 *  `S`= RLOC16
 *  `C`= Router ID
 *  `C`= Next hop to router
 *  `C`= Path cost to router
 *  `C`= Link Quality In
 *  `C`= Link Quality Out
 *  `C`= Age (seconds since last heard)
 *  `b`= Link established with Router ID or not.
 *
 */
let SPINEL_PROP_THREAD_ROUTER_TABLE = SPINEL_PROP_THREAD_EXT__BEGIN + 23;

/// Thread Active Operational Dataset
/** Format= `A(t(iD))` - Read-Write
 *
 * This property provides access to current Thread Active Operational Dataset. A Thread device maintains the
 * Operational Dataset that it has stored locally and the one currently in use by the partition to which it is
 * attached. This property corresponds to the locally stored Dataset on the device.
 *
 * Operational Dataset consists of a set of supported properties (e.g.; channel; master key; network name; PAN id;
 * etc). Note that not all supported properties may be present (have a value) in a Dataset.
 *
 * The Dataset value is encoded as an array of structs containing pairs of property key (as `i`) followed by the
 * property value (as `D`). The property value must follow the format associated with the corresponding property.
 *
 * On write; any unknown/unsupported property keys must be ignored.
 *
 * The following properties can be included in a Dataset list=
 *
 *   SPINEL_PROP_DATASET_ACTIVE_TIMESTAMP
 *   SPINEL_PROP_PHY_CHAN
 *   SPINEL_PROP_PHY_CHAN_SUPPORTED (Channel Mask Page 0)
 *   SPINEL_PROP_NET_MASTER_KEY
 *   SPINEL_PROP_NET_NETWORK_NAME
 *   SPINEL_PROP_NET_XPANID
 *   SPINEL_PROP_MAC_15_4_PANID
 *   SPINEL_PROP_IPV6_ML_PREFIX
 *   SPINEL_PROP_NET_PSKC
 *   SPINEL_PROP_DATASET_SECURITY_POLICY
 *
 */
let SPINEL_PROP_THREAD_ACTIVE_DATASET = SPINEL_PROP_THREAD_EXT__BEGIN + 24;

/// Thread Pending Operational Dataset
/** Format= `A(t(iD))` - Read-Write
 *
 * This property provide access to current locally stored Pending Operational Dataset.
 *
 * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_ACTIVE_DATASET.
 *
 * In addition supported properties in SPINEL_PROP_THREAD_ACTIVE_DATASET; the following properties can also
 * be included in the Pending Dataset=
 *
 *   SPINEL_PROP_DATASET_PENDING_TIMESTAMP
 *   SPINEL_PROP_DATASET_DELAY_TIMER
 *
 */
let SPINEL_PROP_THREAD_PENDING_DATASET = SPINEL_PROP_THREAD_EXT__BEGIN + 25;

/// Send MGMT_SET Thread Active Operational Dataset
/** Format= `A(t(iD))` - Write only
 *
 * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_ACTIVE_DATASET.
 *
 * This is write-only property. When written; it triggers a MGMT_ACTIVE_SET meshcop command to be sent to leader
 * with the given Dataset. The spinel frame response should be a `LAST_STATUS` with the status of the transmission
 * of MGMT_ACTIVE_SET command.
 *
 * In addition to supported properties in SPINEL_PROP_THREAD_ACTIVE_DATASET; the following property can be
 * included in the Dataset (to allow for custom raw TLVs)=
 *
 *    SPINEL_PROP_DATASET_RAW_TLVS
 *
 */
let SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET = SPINEL_PROP_THREAD_EXT__BEGIN + 26;

/// Send MGMT_SET Thread Pending Operational Dataset
/** Format= `A(t(iD))` - Write only
 *
 * This property is similar to SPINEL_PROP_THREAD_PENDING_DATASET and follows the same format and rules.
 *
 * In addition to supported properties in SPINEL_PROP_THREAD_PENDING_DATASET; the following property can be
 * included the Dataset (to allow for custom raw TLVs to be provided).
 *
 *    SPINEL_PROP_DATASET_RAW_TLVS
 *
 */
let SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET = SPINEL_PROP_THREAD_EXT__BEGIN + 27;

/// Operational Dataset Active Timestamp
/** Format= `X` - No direct read or write
 *
 * It can only be included in one of the Dataset related properties below=
 *
 *   SPINEL_PROP_THREAD_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
 *
 */
let SPINEL_PROP_DATASET_ACTIVE_TIMESTAMP = SPINEL_PROP_THREAD_EXT__BEGIN + 28;

/// Operational Dataset Pending Timestamp
/** Format= `X` - No direct read or write
 *
 * It can only be included in one of the Pending Dataset properties=
 *
 *   SPINEL_PROP_THREAD_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
 *
 */
let SPINEL_PROP_DATASET_PENDING_TIMESTAMP = SPINEL_PROP_THREAD_EXT__BEGIN + 29;

/// Operational Dataset Delay Timer
/** Format= `L` - No direct read or write
 *
 * Delay timer (in ms) specifies the time renaming until Thread devices overwrite the value in the Active
 * Operational Dataset with the corresponding values in the Pending Operational Dataset.
 *
 * It can only be included in one of the Pending Dataset properties=
 *
 *   SPINEL_PROP_THREAD_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
 *
 */
let SPINEL_PROP_DATASET_DELAY_TIMER = SPINEL_PROP_THREAD_EXT__BEGIN + 30;

/// Operational Dataset Security Policy
/** Format= `SC` - No direct read or write
 *
 * It can only be included in one of the Dataset related properties below=
 *
 *   SPINEL_PROP_THREAD_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
 *
 * Content is
 *   `S` = Key Rotation Time (in units of hour)
 *   `C` = Security Policy Flags (as specified in Thread 1.1 Section 8.10.1.15)
 *
 */
let SPINEL_PROP_DATASET_SECURITY_POLICY = SPINEL_PROP_THREAD_EXT__BEGIN + 31;

/// Operational Dataset Additional Raw TLVs
/** Format= `D` - No direct read or write
 *
 * This property defines extra raw TLVs that can be added to an Operational DataSet.
 *
 * It can only be included in one of the following Dataset properties=
 *
 *   SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
 *
 */
let SPINEL_PROP_DATASET_RAW_TLVS = SPINEL_PROP_THREAD_EXT__BEGIN + 32;

/// Child table addresses
/** Format= `A(t(ESA(6)))` - Read only
 *
 * This property provides the list of all addresses associated with every child
 * including any registered IPv6 addresses.
 *
 * Data per item is=
 *
 *  `E`= Extended address of the child
 *  `S`= RLOC16 of the child
 *  `A(6)`= List of IPv6 addresses registered by the child (if any)
 *
 */
let SPINEL_PROP_THREAD_CHILD_TABLE_ADDRESSES = SPINEL_PROP_THREAD_EXT__BEGIN + 33;

/// Neighbor Table Frame and Message Error Rates
/** Format= `A(t(ESSScc))`
 *  Required capability= `CAP_ERROR_RATE_TRACKING`
 *
 * This property provides link quality related info including
 * frame and (IPv6) message error rates for all neighbors.
 *
 * With regards to message error rate; note that a larger (IPv6)
 * message can be fragmented and sent as multiple MAC frames. The
 * message transmission is considered a failure; if any of its
 * fragments fail after all MAC retry attempts.
 *
 * Data per item is=
 *
 *  `E`= Extended address of the neighbor
 *  `S`= RLOC16 of the neighbor
 *  `S`= Frame error rate (0 -> 0%; 0xffff -> 100%)
 *  `S`= Message error rate (0 -> 0%; 0xffff -> 100%)
 *  `c`= Average RSSI (in dBm)
 *  `c`= Last RSSI (in dBm)
 *
 */
let SPINEL_PROP_THREAD_NEIGHBOR_TABLE_ERROR_RATES = SPINEL_PROP_THREAD_EXT__BEGIN + 34;

/// EID (Endpoint Identifier) IPv6 Address Cache Table
/** Format `A(t(6SC))`
 *
 * This property provides Thread EID address cache table.
 *
 * Data per item is=
 *
 *  `6` = Target IPv6 address
 *  `S` = RLOC16 of target
 *  `C` = Age (order of use; 0 indicates most recently used entry)
 *
 */
let SPINEL_PROP_THREAD_ADDRESS_CACHE_TABLE = SPINEL_PROP_THREAD_EXT__BEGIN + 35;

/// Thread UDP proxy stream
/** Format `dS6S`
 * Required capability= `SPINEL_CAP_THREAD_UDP_PROXY`
 *
 * This property helps exchange UDP packets with host.
 *
 *  `d`= UDP payload
 *  `S`= Remote UDP port
 *  `6`= Remote IPv6 address
 *  `S`= Local UDP port
 *
 */
let SPINEL_PROP_THREAD_UDP_PROXY_STREAM = SPINEL_PROP_THREAD_EXT__BEGIN + 36;

/// Send MGMT_GET Thread Active Operational Dataset
/** Format= `A(t(iD))` - Write only
 *
 * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET. This
 * property further allows the sender to not include a value associated with properties in formating of `t(iD)`;
 * i.e.; it should accept either a `t(iD)` or a `t(i)` encoding (in both cases indicating that the associated
 * Dataset property should be requested as part of MGMT_GET command).
 *
 * This is write-only property. When written; it triggers a MGMT_ACTIVE_GET meshcop command to be sent to leader
 * requesting the Dataset related properties from the format. The spinel frame response should be a `LAST_STATUS`
 * with the status of the transmission of MGMT_ACTIVE_GET command.
 *
 * In addition to supported properties in SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET; the following property can be
 * optionally included in the Dataset=
 *
 *    SPINEL_PROP_DATASET_DEST_ADDRESS
 *
 */
let SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET = SPINEL_PROP_THREAD_EXT__BEGIN + 37;

/// Send MGMT_GET Thread Pending Operational Dataset
/** Format= `A(t(iD))` - Write only
 *
 * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET.
 *
 * This is write-only property. When written; it triggers a MGMT_PENDING_GET meshcop command to be sent to leader
 * with the given Dataset. The spinel frame response should be a `LAST_STATUS` with the status of the transmission
 * of MGMT_PENDING_GET command.
 *
 */
let SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET = SPINEL_PROP_THREAD_EXT__BEGIN + 38;

/// Operational Dataset (MGMT_GET) Destination IPv6 Address
/** Format= `6` - No direct read or write
 *
 * This property specifies the IPv6 destination when sending MGMT_GET command for either Active or Pending Dataset
 * if not provided; Leader ALOC address is used as default.
 *
 * It can only be included in one of the MGMT_GET Dataset properties=
 *
 *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
 *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
 *
 */
let SPINEL_PROP_DATASET_DEST_ADDRESS = SPINEL_PROP_THREAD_EXT__BEGIN + 39;

let SPINEL_PROP_THREAD_EXT__END = 0x1600;

let SPINEL_PROP_IPV6__BEGIN    = 0x60;
let SPINEL_PROP_IPV6_LL_ADDR   = SPINEL_PROP_IPV6__BEGIN + 0; ///< [6]
let SPINEL_PROP_IPV6_ML_ADDR   = SPINEL_PROP_IPV6__BEGIN + 1; ///< [6C]
let SPINEL_PROP_IPV6_ML_PREFIX = SPINEL_PROP_IPV6__BEGIN + 2; ///< [6C]

/// IPv6 Address Table
/** Format= `A(t(6CLLC))`
 *
 * This property provides all unicast addresses.
 *
 * Array of structures containing=
 *
 *  `6`= IPv6 Address
 *  `C`= Network Prefix Length
 *  `L`= Valid Lifetime
 *  `L`= Preferred Lifetime
 *  `C`= Flags
 *
 */
let SPINEL_PROP_IPV6_ADDRESS_TABLE = SPINEL_PROP_IPV6__BEGIN + 3;

let SPINEL_PROP_IPV6_ROUTE_TABLE =
    SPINEL_PROP_IPV6__BEGIN + 4; ///< array(ipv6prefix;prefixlen;iface;flags) [A(t(6CCC))]

/// IPv6 ICMP Ping Offload
/** Format= `b`
 *
 * Allow the NCP to directly respond to ICMP ping requests. If this is
 * turned on; ping request ICMP packets will not be passed to the host.
 *
 * Default value is `false`.
 */
let SPINEL_PROP_IPV6_ICMP_PING_OFFLOAD = SPINEL_PROP_IPV6__BEGIN + 5; ///< [b]

let SPINEL_PROP_IPV6_MULTICAST_ADDRESS_TABLE = SPINEL_PROP_IPV6__BEGIN + 6; ///< [A(t(6))]

/// IPv6 ICMP Ping Offload
/** Format= `C`
 *
 * Allow the NCP to directly respond to ICMP ping requests. If this is
 * turned on; ping request ICMP packets will not be passed to the host.
 *
 * This property allows enabling responses sent to unicast only; multicast
 * only; or both.
 *
 * Default value is `NET_IPV6_ICMP_PING_OFFLOAD_DISABLED`.
 */
let SPINEL_PROP_IPV6_ICMP_PING_OFFLOAD_MODE = SPINEL_PROP_IPV6__BEGIN + 7; ///< [b]

let SPINEL_PROP_IPV6__END = 0x70;

let SPINEL_PROP_IPV6_EXT__BEGIN = 0x1600;
let SPINEL_PROP_IPV6_EXT__END   = 0x1700;

let SPINEL_PROP_STREAM__BEGIN       = 0x70;
let SPINEL_PROP_STREAM_DEBUG        = SPINEL_PROP_STREAM__BEGIN + 0; ///< [U]
let SPINEL_PROP_STREAM_RAW          = SPINEL_PROP_STREAM__BEGIN + 1; ///< [dD]
let SPINEL_PROP_STREAM_NET          = SPINEL_PROP_STREAM__BEGIN + 2; ///< [dD]
let SPINEL_PROP_STREAM_NET_INSECURE = SPINEL_PROP_STREAM__BEGIN + 3; ///< [dD]

/// Log Stream
/** Format= `UD` (stream; read only)
 *
 * This property is a read-only streaming property which provides
 * formatted log string from NCP. This property provides asynchronous
 * `CMD_PROP_VALUE_IS` updates with a new log string and includes
 * optional meta data.
 *
 *   `U`= The log string
 *   `D`= Log metadata (optional).
 *
 * Any data after the log string is considered metadata and is OPTIONAL.
 * Pretense of `SPINEL_CAP_OPENTHREAD_LOG_METADATA` capability
 * indicates that OpenThread log metadata format is used as defined
 * below=
 *
 *    `C`= Log level (as per definition in enumeration
 *         `SPINEL_NCP_LOG_LEVEL_<level>`)
 *    `i`= OpenThread Log region (as per definition in enumeration
 *         `SPINEL_NCP_LOG_REGION_<region>).
 *
 */
let SPINEL_PROP_STREAM_LOG  = SPINEL_PROP_STREAM__BEGIN + 4;
let SPINEL_PROP_STREAM__END = 0x80;

let SPINEL_PROP_STREAM_EXT__BEGIN = 0x1700;
let SPINEL_PROP_STREAM_EXT__END   = 0x1800;

let SPINEL_PROP_MESHCOP__BEGIN = 0x80;

// Thread Joiner State
/** Format `C` - Read Only
 *
 * Required capability= SPINEL_CAP_THREAD_JOINER
 *
 * The valid values are specified by SPINEL_MESHCOP_COMMISIONER_STATE_<state> enumeration.
 *
 */
let SPINEL_PROP_MESHCOP_JOINER_STATE = SPINEL_PROP_MESHCOP__BEGIN + 0; ///<[C]

/// Thread Joiner Commissioning command and the parameters
/** Format `bUU` - Write Only
 *
 * This property starts or stops Joiner's commissioning process
 *
 * Required capability= SPINEL_CAP_THREAD_JOINER
 *
 * Writing to this property starts/stops the Joiner commissioning process.
 * The immediate `VALUE_IS` response indicates success/failure of the starting/stopping
 * the Joiner commissioning process.
 *
 * After a successful start operation; the join process outcome is reported through an
 * asynchronous `VALUE_IS(LAST_STATUS)`  update with one of the following error status values=
 *
 *     - SPINEL_STATUS_JOIN_SUCCESS     the join process succeeded.
 *     - SPINEL_STATUS_JOIN_SECURITY    the join process failed due to security credentials.
 *     - SPINEL_STATUS_JOIN_NO_PEERS    no joinable network was discovered.
 *     - SPINEL_STATUS_JOIN_RSP_TIMEOUT if a response timed out.
 *     - SPINEL_STATUS_JOIN_FAILURE     join failure.
 *
 * Data per item is=
 *
 *  `b` = Start or stop commissioning process
 *  `U` = Joiner's PSKd if start commissioning; empty string if stop commissioning
 *  `U` = Provisioning url if start commissioning; empty string if stop commissioning
 *
 */
let SPINEL_PROP_MESHCOP_JOINER_COMMISSIONING = SPINEL_PROP_MESHCOP__BEGIN + 1;

// Thread Commissioner State
/** Format `C`
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * The valid values are specified by SPINEL_MESHCOP_COMMISIONER_STATE_<state> enumeration.
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_STATE = SPINEL_PROP_MESHCOP__BEGIN + 2;

// Thread Commissioner Joiners
/** Format `A(t(E)UL)` - insert or remove only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * Data per item is=
 *
 *  `t(E)` | `t()`= Joiner EUI64. Empty struct indicates any Joiner
 *  `L`           = Timeout (in seconds) after which the Joiner is automatically removed
 *  `U`           = PSKd
 *
 * For CMD_PROP_VALUE_REMOVE the timeout and PSKd are optional.
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_JOINERS = SPINEL_PROP_MESHCOP__BEGIN + 3;

// Thread Commissioner Provisioning URL
/** Format `U`
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_PROVISIONING_URL = SPINEL_PROP_MESHCOP__BEGIN + 4;

// Thread Commissioner Session ID
/** Format `S` - Read only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_SESSION_ID = SPINEL_PROP_MESHCOP__BEGIN + 5;

let SPINEL_PROP_MESHCOP__END = 0x90;

let SPINEL_PROP_MESHCOP_EXT__BEGIN = 0x1800;

// Thread Commissioner Announce Begin
/** Format `LCS6` - Write only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * Writing to this property sends an Announce Begin message with the specified parameters. Response is a
 * `LAST_STATUS` update with status of operation.
 *
 *   `L` = Channel mask
 *   `C` = Number of messages per channel
 *   `S` = The time between two successive MLE Announce transmissions (milliseconds)
 *   `6` = IPv6 destination
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_ANNOUNCE_BEGIN = SPINEL_PROP_MESHCOP_EXT__BEGIN + 0;

// Thread Commissioner Energy Scan Query
/** Format `LCSS6` - Write only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * Writing to this property sends an Energy Scan Query message with the specified parameters. Response is a
 * `LAST_STATUS` with status of operation. The energy scan results are emitted asynchronously through
 * `SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN_RESULT` updates.
 *
 * Format is=
 *
 *   `L` = Channel mask
 *   `C` = The number of energy measurements per channel
 *   `S` = The time between energy measurements (milliseconds)
 *   `S` = The scan duration for each energy measurement (milliseconds)
 *   `6` = IPv6 destination.
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN = SPINEL_PROP_MESHCOP_EXT__BEGIN + 1;

// Thread Commissioner Energy Scan Result
/** Format `Ld` - Asynchronous event only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * This property provides asynchronous `CMD_PROP_VALUE_INSERTED` updates to report energy scan results for a
 * previously sent Energy Scan Query message (please see `SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN`).
 *
 * Format is=
 *
 *   `L` = Channel mask
 *   `d` = Energy measurement data (note that `d` encoding includes the length)
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN_RESULT = SPINEL_PROP_MESHCOP_EXT__BEGIN + 2;

// Thread Commissioner PAN ID Query
/** Format `SL6` - Write only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * Writing to this property sends a PAN ID Query message with the specified parameters. Response is a
 * `LAST_STATUS` with status of operation. The PAN ID Conflict results are emitted asynchronously through
 * `SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_CONFLICT_RESULT` updates.
 *
 * Format is=
 *
 *   `S` = PAN ID to query
 *   `L` = Channel mask
 *   `6` = IPv6 destination
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_QUERY = SPINEL_PROP_MESHCOP_EXT__BEGIN + 3;

// Thread Commissioner PAN ID Conflict Result
/** Format `SL` - Asynchronous event only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * This property provides asynchronous `CMD_PROP_VALUE_INSERTED` updates to report PAN ID conflict results for a
 * previously sent PAN ID Query message (please see `SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_QUERY`).
 *
 * Format is=
 *
 *   `S` = The PAN ID
 *   `L` = Channel mask
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_CONFLICT_RESULT = SPINEL_PROP_MESHCOP_EXT__BEGIN + 4;

// Thread Commissioner Send MGMT_COMMISSIONER_GET
/** Format `d` - Write only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * Writing to this property sends a MGMT_COMMISSIONER_GET message with the specified parameters. Response is a
 * `LAST_STATUS` with status of operation.
 *
 * Format is=
 *
 *   `d` = List of TLV types to get
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_MGMT_GET = SPINEL_PROP_MESHCOP_EXT__BEGIN + 5;

// Thread Commissioner Send MGMT_COMMISSIONER_SET
/** Format `d` - Write only
 *
 * Required capability= SPINEL_CAP_THREAD_COMMISSIONER
 *
 * Writing to this property sends a MGMT_COMMISSIONER_SET message with the specified parameters. Response is a
 * `LAST_STATUS` with status of operation.
 *
 * Format is=
 *
 *   `d` = TLV encoded data
 *
 */
let SPINEL_PROP_MESHCOP_COMMISSIONER_MGMT_SET = SPINEL_PROP_MESHCOP_EXT__BEGIN + 6;

let SPINEL_PROP_MESHCOP_EXT__END = 0x1900;

let SPINEL_PROP_OPENTHREAD__BEGIN = 0x1900;

/// Channel Manager - Channel Change New Channel
/** Format= `C` (read-write)
 *
 * Required capability= SPINEL_CAP_CHANNEL_MANAGER
 *
 * Setting this property triggers the Channel Manager to start
 * a channel change process. The network switches to the given
 * channel after the specified delay (see `CHANNEL_MANAGER_DELAY`).
 *
 * A subsequent write to this property will cancel an ongoing
 * (previously requested) channel change.
 *
 */
let SPINEL_PROP_CHANNEL_MANAGER_NEW_CHANNEL = SPINEL_PROP_OPENTHREAD__BEGIN + 0;

/// Channel Manager - Channel Change Delay
/** Format 'S'
 *  Units= seconds
 *
 * Required capability= SPINEL_CAP_CHANNEL_MANAGER
 *
 * This property specifies the delay (in seconds) to be used for
 * a channel change request.
 *
 * The delay should preferably be longer than maximum data poll
 * interval used by all sleepy-end-devices within the Thread
 * network.
 *
 */
let SPINEL_PROP_CHANNEL_MANAGER_DELAY = SPINEL_PROP_OPENTHREAD__BEGIN + 1;

/// Channel Manager Supported Channels
/** Format 'A(C)'
 *
 * Required capability= SPINEL_CAP_CHANNEL_MANAGER
 *
 * This property specifies the list of supported channels.
 *
 */
let SPINEL_PROP_CHANNEL_MANAGER_SUPPORTED_CHANNELS = SPINEL_PROP_OPENTHREAD__BEGIN + 2;

/// Channel Manager Favored Channels
/** Format 'A(C)'
 *
 * Required capability= SPINEL_CAP_CHANNEL_MANAGER
 *
 * This property specifies the list of favored channels (when `ChannelManager` is asked to select channel)
 *
 */
let SPINEL_PROP_CHANNEL_MANAGER_FAVORED_CHANNELS = SPINEL_PROP_OPENTHREAD__BEGIN + 3;

/// Channel Manager Channel Select Trigger
/** Format 'b'
 *
 * Required capability= SPINEL_CAP_CHANNEL_MANAGER
 *
 * Writing to this property triggers a request on `ChannelManager` to select a new channel.
 *
 * Once a Channel Select is triggered; the Channel Manager will perform the following 3 steps=
 *
 * 1) `ChannelManager` decides if the channel change would be helpful. This check can be skipped if in the input
 *    boolean to this property is set to `true` (skipping the quality check).
 *    This step uses the collected link quality metrics on the device such as CCA failure rate; frame and message
 *    error rates per neighbor; etc. to determine if the current channel quality is at the level that justifies
 *    a channel change.
 *
 * 2) If first step passes; then `ChannelManager` selects a potentially better channel. It uses the collected
 *    channel quality data by `ChannelMonitor` module. The supported and favored channels are used at this step.
 *
 * 3) If the newly selected channel is different from the current channel; `ChannelManager` requests/starts the
 *    channel change process.
 *
 * Reading this property always yields `false`.
 *
 */
let SPINEL_PROP_CHANNEL_MANAGER_CHANNEL_SELECT = SPINEL_PROP_OPENTHREAD__BEGIN + 4;

/// Channel Manager Auto Channel Selection Enabled
/** Format 'b'
 *
 * Required capability= SPINEL_CAP_CHANNEL_MANAGER
 *
 * This property indicates if auto-channel-selection functionality is enabled/disabled on `ChannelManager`.
 *
 * When enabled; `ChannelManager` will periodically checks and attempts to select a new channel. The period interval
 * is specified by `SPINEL_PROP_CHANNEL_MANAGER_AUTO_SELECT_INTERVAL`.
 *
 */
let SPINEL_PROP_CHANNEL_MANAGER_AUTO_SELECT_ENABLED = SPINEL_PROP_OPENTHREAD__BEGIN + 5;

/// Channel Manager Auto Channel Selection Interval
/** Format 'L'
 *  units= seconds
 *
 * Required capability= SPINEL_CAP_CHANNEL_MANAGER
 *
 * This property specifies the auto-channel-selection check interval (in seconds).
 *
 */
let SPINEL_PROP_CHANNEL_MANAGER_AUTO_SELECT_INTERVAL = SPINEL_PROP_OPENTHREAD__BEGIN + 6;

/// Thread network time.
/** Format= `Xc` - Read only
 *
 * Data per item is=
 *
 *  `X`= The Thread network time; in microseconds.
 *  `c`= Time synchronization status.
 *
 */
let SPINEL_PROP_THREAD_NETWORK_TIME = SPINEL_PROP_OPENTHREAD__BEGIN + 7;

/// Thread time synchronization period
/** Format= `S` - Read-Write
 *
 * Data per item is=
 *
 *  `S`= Time synchronization period; in seconds.
 *
 */
let SPINEL_PROP_TIME_SYNC_PERIOD = SPINEL_PROP_OPENTHREAD__BEGIN + 8;

/// Thread Time synchronization XTAL accuracy threshold for Router
/** Format= `S` - Read-Write
 *
 * Data per item is=
 *
 *  `S`= The XTAL accuracy threshold for Router; in PPM.
 *
 */
let SPINEL_PROP_TIME_SYNC_XTAL_THRESHOLD = SPINEL_PROP_OPENTHREAD__BEGIN + 9;

/// Child Supervision Interval
/** Format= `S` - Read-Write
 *  Units= Seconds
 *
 * Required capability= `SPINEL_CAP_CHILD_SUPERVISION`
 *
 * The child supervision interval (in seconds). Zero indicates that child supervision is disabled.
 *
 * When enabled; Child supervision feature ensures that at least one message is sent to every sleepy child within
 * the given supervision interval. If there is no other message; a supervision message (a data message with empty
 * payload) is enqueued and sent to the child.
 *
 * This property is available for FTD build only.
 *
 */
let SPINEL_PROP_CHILD_SUPERVISION_INTERVAL = SPINEL_PROP_OPENTHREAD__BEGIN + 10;

/// Child Supervision Check Timeout
/** Format= `S` - Read-Write
 *  Units= Seconds
 *
 * Required capability= `SPINEL_CAP_CHILD_SUPERVISION`
 *
 * The child supervision check timeout interval (in seconds). Zero indicates supervision check on the child is
 * disabled.
 *
 * Supervision check is only applicable on a sleepy child. When enabled; if the child does not hear from its parent
 * within the specified check timeout; it initiates a re-attach process by starting an MLE Child Update
 * Request/Response exchange with the parent.
 *
 * This property is available for FTD and MTD builds.
 *
 */
let SPINEL_PROP_CHILD_SUPERVISION_CHECK_TIMEOUT = SPINEL_PROP_OPENTHREAD__BEGIN + 11;

let SPINEL_PROP_OPENTHREAD__END = 0x2000;

let SPINEL_PROP_INTERFACE__BEGIN = 0x100;

/// UART Bitrate
/** Format= `L`
 *
 *  If the NCP is using a UART to communicate with the host;
 *  this property allows the host to change the bitrate
 *  of the serial connection. The value encoding is `L`;
 *  which is a little-endian 32-bit unsigned integer.
 *  The host should not assume that all possible numeric values
 *  are supported.
 *
 *  If implemented by the NCP; this property should be persistent
 *  across software resets and forgotten upon hardware resets.
 *
 *  This property is only implemented when a UART is being
 *  used for Spinel. This property is optional.
 *
 *  When changing the bitrate; all frames will be received
 *  at the previous bitrate until the response frame to this command
 *  is received. Once a successful response frame is received by
 *  the host; all further frames will be transmitted at the new
 *  bitrate.
 */
let SPINEL_PROP_UART_BITRATE = SPINEL_PROP_INTERFACE__BEGIN + 0;

/// UART Software Flow Control
/** Format= `b`
 *
 *  If the NCP is using a UART to communicate with the host;
 *  this property allows the host to determine if software flow
 *  control (XON/XOFF style) should be used and (optionally) to
 *  turn it on or off.
 *
 *  This property is only implemented when a UART is being
 *  used for Spinel. This property is optional.
 */
let SPINEL_PROP_UART_XON_XOFF = SPINEL_PROP_INTERFACE__BEGIN + 1;

let SPINEL_PROP_INTERFACE__END = 0x200;

let SPINEL_PROP_15_4_PIB__BEGIN = 0x400;
// For direct access to the 802.15.4 PID.
// Individual registers are fetched using
// `SPINEL_PROP_15_4_PIB__BEGIN+[PIB_IDENTIFIER]`
// Only supported if SPINEL_CAP_15_4_PIB is set.
//
// For brevity; the entire 802.15.4 PIB space is
// not defined here; but a few choice attributes
// are defined for illustration and convenience.
let SPINEL_PROP_15_4_PIB_PHY_CHANNELS_SUPPORTED = SPINEL_PROP_15_4_PIB__BEGIN + 0x01; ///< [A(L)]
let SPINEL_PROP_15_4_PIB_MAC_PROMISCUOUS_MODE   = SPINEL_PROP_15_4_PIB__BEGIN + 0x51; ///< [b]
let SPINEL_PROP_15_4_PIB_MAC_SECURITY_ENABLED   = SPINEL_PROP_15_4_PIB__BEGIN + 0x5d; ///< [b]
let SPINEL_PROP_15_4_PIB__END                   = 0x500;

let SPINEL_PROP_CNTR__BEGIN = 0x500;

/// Counter reset behavior
/** Format= `C`
 *  Writing a '1' to this property will reset
 *  all of the counters to zero. */
let SPINEL_PROP_CNTR_RESET = SPINEL_PROP_CNTR__BEGIN + 0;

/// The total number of transmissions.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_TOTAL = SPINEL_PROP_CNTR__BEGIN + 1;

/// The number of transmissions with ack request.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_ACK_REQ = SPINEL_PROP_CNTR__BEGIN + 2;

/// The number of transmissions that were acked.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_ACKED = SPINEL_PROP_CNTR__BEGIN + 3;

/// The number of transmissions without ack request.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_NO_ACK_REQ = SPINEL_PROP_CNTR__BEGIN + 4;

/// The number of transmitted data.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_DATA = SPINEL_PROP_CNTR__BEGIN + 5;

/// The number of transmitted data poll.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_DATA_POLL = SPINEL_PROP_CNTR__BEGIN + 6;

/// The number of transmitted beacon.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_BEACON = SPINEL_PROP_CNTR__BEGIN + 7;

/// The number of transmitted beacon request.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_BEACON_REQ = SPINEL_PROP_CNTR__BEGIN + 8;

/// The number of transmitted other types of frames.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_OTHER = SPINEL_PROP_CNTR__BEGIN + 9;

/// The number of retransmission times.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_RETRY = SPINEL_PROP_CNTR__BEGIN + 10;

/// The number of CCA failure times.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_ERR_CCA = SPINEL_PROP_CNTR__BEGIN + 11;

/// The number of unicast packets transmitted.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_UNICAST = SPINEL_PROP_CNTR__BEGIN + 12;

/// The number of broadcast packets transmitted.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_PKT_BROADCAST = SPINEL_PROP_CNTR__BEGIN + 13;

/// The number of frame transmission failures due to abort error.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_ERR_ABORT = SPINEL_PROP_CNTR__BEGIN + 14;

/// The total number of received packets.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_TOTAL = SPINEL_PROP_CNTR__BEGIN + 100;

/// The number of received data.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_DATA = SPINEL_PROP_CNTR__BEGIN + 101;

/// The number of received data poll.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_DATA_POLL = SPINEL_PROP_CNTR__BEGIN + 102;

/// The number of received beacon.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_BEACON = SPINEL_PROP_CNTR__BEGIN + 103;

/// The number of received beacon request.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_BEACON_REQ = SPINEL_PROP_CNTR__BEGIN + 104;

/// The number of received other types of frames.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_OTHER = SPINEL_PROP_CNTR__BEGIN + 105;

/// The number of received packets filtered by whitelist.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_FILT_WL = SPINEL_PROP_CNTR__BEGIN + 106;

/// The number of received packets filtered by destination check.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_FILT_DA = SPINEL_PROP_CNTR__BEGIN + 107;

/// The number of received packets that are empty.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_ERR_EMPTY = SPINEL_PROP_CNTR__BEGIN + 108;

/// The number of received packets from an unknown neighbor.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_ERR_UKWN_NBR = SPINEL_PROP_CNTR__BEGIN + 109;

/// The number of received packets whose source address is invalid.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_ERR_NVLD_SADDR = SPINEL_PROP_CNTR__BEGIN + 110;

/// The number of received packets with a security error.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_ERR_SECURITY = SPINEL_PROP_CNTR__BEGIN + 111;

/// The number of received packets with a checksum error.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_ERR_BAD_FCS = SPINEL_PROP_CNTR__BEGIN + 112;

/// The number of received packets with other errors.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_ERR_OTHER = SPINEL_PROP_CNTR__BEGIN + 113;

/// The number of received duplicated.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_DUP = SPINEL_PROP_CNTR__BEGIN + 114;

/// The number of unicast packets received.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_UNICAST = SPINEL_PROP_CNTR__BEGIN + 115;

/// The number of broadcast packets received.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_PKT_BROADCAST = SPINEL_PROP_CNTR__BEGIN + 116;

/// The total number of secure transmitted IP messages.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_IP_SEC_TOTAL = SPINEL_PROP_CNTR__BEGIN + 200;

/// The total number of insecure transmitted IP messages.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_IP_INSEC_TOTAL = SPINEL_PROP_CNTR__BEGIN + 201;

/// The number of dropped (not transmitted) IP messages.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_IP_DROPPED = SPINEL_PROP_CNTR__BEGIN + 202;

/// The total number of secure received IP message.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_IP_SEC_TOTAL = SPINEL_PROP_CNTR__BEGIN + 203;

/// The total number of insecure received IP message.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_IP_INSEC_TOTAL = SPINEL_PROP_CNTR__BEGIN + 204;

/// The number of dropped received IP messages.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_IP_DROPPED = SPINEL_PROP_CNTR__BEGIN + 205;

/// The number of transmitted spinel frames.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_TX_SPINEL_TOTAL = SPINEL_PROP_CNTR__BEGIN + 300;

/// The number of received spinel frames.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_SPINEL_TOTAL = SPINEL_PROP_CNTR__BEGIN + 301;

/// The number of received spinel frames with error.
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_SPINEL_ERR = SPINEL_PROP_CNTR__BEGIN + 302;

/// Number of out of order received spinel frames (tid increase by more than 1).
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_RX_SPINEL_OUT_OF_ORDER_TID = SPINEL_PROP_CNTR__BEGIN + 303;

/// The number of successful Tx IP packets
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_IP_TX_SUCCESS = SPINEL_PROP_CNTR__BEGIN + 304;

/// The number of successful Rx IP packets
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_IP_RX_SUCCESS = SPINEL_PROP_CNTR__BEGIN + 305;

/// The number of failed Tx IP packets
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_IP_TX_FAILURE = SPINEL_PROP_CNTR__BEGIN + 306;

/// The number of failed Rx IP packets
/** Format= `L` (Read-only) */
let SPINEL_PROP_CNTR_IP_RX_FAILURE = SPINEL_PROP_CNTR__BEGIN + 307;

/// The message buffer counter info
/** Format= `SSSSSSSSSSSSSSSS` (Read-only)
 *      `S`; (TotalBuffers)           The number of buffers in the pool.
 *      `S`; (FreeBuffers)            The number of free message buffers.
 *      `S`; (6loSendMessages)        The number of messages in the 6lo send queue.
 *      `S`; (6loSendBuffers)         The number of buffers in the 6lo send queue.
 *      `S`; (6loReassemblyMessages)  The number of messages in the 6LoWPAN reassembly queue.
 *      `S`; (6loReassemblyBuffers)   The number of buffers in the 6LoWPAN reassembly queue.
 *      `S`; (Ip6Messages)            The number of messages in the IPv6 send queue.
 *      `S`; (Ip6Buffers)             The number of buffers in the IPv6 send queue.
 *      `S`; (MplMessages)            The number of messages in the MPL send queue.
 *      `S`; (MplBuffers)             The number of buffers in the MPL send queue.
 *      `S`; (MleMessages)            The number of messages in the MLE send queue.
 *      `S`; (MleBuffers)             The number of buffers in the MLE send queue.
 *      `S`; (ArpMessages)            The number of messages in the ARP send queue.
 *      `S`; (ArpBuffers)             The number of buffers in the ARP send queue.
 *      `S`; (CoapMessages)           The number of messages in the CoAP send queue.
 *      `S`; (CoapBuffers)            The number of buffers in the CoAP send queue.
 */
let SPINEL_PROP_MSG_BUFFER_COUNTERS = SPINEL_PROP_CNTR__BEGIN + 400;

/// All MAC related counters.
/** Format= t(A(L))t(A(L))  (Read-only)
 *
 * The contents include two structs; first one corresponds to
 * all transmit related MAC counters; second one provides the
 * receive related counters.
 *
 * The transmit structure includes=
 *
 *   'L'= TxTotal              (The total number of transmissions).
 *   'L'= TxUnicast            (The total number of unicast transmissions).
 *   'L'= TxBroadcast          (The total number of broadcast transmissions).
 *   'L'= TxAckRequested       (The number of transmissions with ack request).
 *   'L'= TxAcked              (The number of transmissions that were acked).
 *   'L'= TxNoAckRequested     (The number of transmissions without ack request).
 *   'L'= TxData               (The number of transmitted data).
 *   'L'= TxDataPoll           (The number of transmitted data poll).
 *   'L'= TxBeacon             (The number of transmitted beacon).
 *   'L'= TxBeaconRequest      (The number of transmitted beacon request).
 *   'L'= TxOther              (The number of transmitted other types of frames).
 *   'L'= TxRetry              (The number of retransmission times).
 *   'L'= TxErrCca             (The number of CCA failure times).
 *   'L'= TxErrAbort           (The number of frame transmission failures due to abort error).
 *   'L'= TxErrBusyChannel     (The number of frames that were dropped due to a busy channel).
 *
 * The receive structure includes=
 *
 *   'L'= RxTotal              (The total number of received packets).
 *   'L'= RxUnicast            (The total number of unicast packets received).
 *   'L'= RxBroadcast          (The total number of broadcast packets received).
 *   'L'= RxData               (The number of received data).
 *   'L'= RxDataPoll           (The number of received data poll).
 *   'L'= RxBeacon             (The number of received beacon).
 *   'L'= RxBeaconRequest      (The number of received beacon request).
 *   'L'= RxOther              (The number of received other types of frames).
 *   'L'= RxAddressFiltered    (The number of received packets filtered by address filter (whitelist or blacklist)).
 *   'L'= RxDestAddrFiltered   (The number of received packets filtered by destination check).
 *   'L'= RxDuplicated         (The number of received duplicated packets).
 *   'L'= RxErrNoFrame         (The number of received packets with no or malformed content).
 *   'L'= RxErrUnknownNeighbor (The number of received packets from unknown neighbor).
 *   'L'= RxErrInvalidSrcAddr  (The number of received packets whose source address is invalid).
 *   'L'= RxErrSec             (The number of received packets with security error).
 *   'L'= RxErrFcs             (The number of received packets with FCS error).
 *   'L'= RxErrOther           (The number of received packets with other error).
 */
let SPINEL_PROP_CNTR_ALL_MAC_COUNTERS = SPINEL_PROP_CNTR__BEGIN + 401;

let SPINEL_PROP_CNTR__END = 0x800;

let SPINEL_PROP_NEST__BEGIN = 0x3BC0;

let SPINEL_PROP_NEST_STREAM_MFG = SPINEL_PROP_NEST__BEGIN + 0;

/// The legacy network ULA prefix (8 bytes)
/** Format= 'D' */
let SPINEL_PROP_NEST_LEGACY_ULA_PREFIX = SPINEL_PROP_NEST__BEGIN + 1;

/// The EUI64 of last node joined using legacy protocol (if none; all zero EUI64 is returned).
/** Format= 'E' */
let SPINEL_PROP_NEST_LEGACY_LAST_NODE_JOINED = SPINEL_PROP_NEST__BEGIN + 2;

let SPINEL_PROP_NEST__END = 0x3C00;

let SPINEL_PROP_VENDOR__BEGIN = 0x3C00;
let SPINEL_PROP_VENDOR__END   = 0x4000;

let SPINEL_PROP_DEBUG__BEGIN = 0x4000;

/// Testing platform assert
/** Format= 'b' (read-only)
 *
 * Reading this property will cause an assert on the NCP. This is intended for testing the assert functionality of
 * underlying platform/NCP. Assert should ideally cause the NCP to reset; but if this is not supported a `false`
 * boolean is returned in response.
 *
 */
let SPINEL_PROP_DEBUG_TEST_ASSERT = SPINEL_PROP_DEBUG__BEGIN + 0;

/// The NCP log level.
/** Format= `C` */
let SPINEL_PROP_DEBUG_NCP_LOG_LEVEL = SPINEL_PROP_DEBUG__BEGIN + 1;

/// Testing platform watchdog
/** Format= Empty  (read-only)
 *
 * Reading this property will causes NCP to start a `while(true) ;` loop and thus triggering a watchdog.
 *
 * This is intended for testing the watchdog functionality on the underlying platform/NCP.
 *
 */
let SPINEL_PROP_DEBUG_TEST_WATCHDOG = SPINEL_PROP_DEBUG__BEGIN + 2;

let SPINEL_PROP_DEBUG__END = 0x4400;

let SPINEL_PROP_EXPERIMENTAL__BEGIN = 2000000;
let SPINEL_PROP_EXPERIMENTAL__END   = 2097152;

exports.kProperty = {
    SPINEL_PROP_LAST_STATUS      : 0,  ///< status [i]
    SPINEL_PROP_PROTOCOL_VERSION : 1,  ///< major, minor [i,i]
    SPINEL_PROP_NCP_VERSION      : 2,  ///< version string [U]
    SPINEL_PROP_INTERFACE_TYPE   : 3,  ///< [i]
    SPINEL_PROP_VENDOR_ID        : 4,  ///< [i]
    SPINEL_PROP_CAPS             : 5,  ///< capability list [A(i)]
    SPINEL_PROP_INTERFACE_COUNT  : 6,  ///< Interface count [C]
    SPINEL_PROP_POWER_STATE      : 7,  ///< PowerState [C] (deprecated, use `MCU_POWER_STATE` instead).
    SPINEL_PROP_HWADDR           : 8,  ///< PermEUI64 [E]
    SPINEL_PROP_LOCK             : 9,  ///< PropLock [b]
    SPINEL_PROP_HBO_MEM_MAX      : 10, ///< Max offload mem [S]
    SPINEL_PROP_HBO_BLOCK_MAX    : 11, ///< Max offload block [S]
    SPINEL_PROP_HOST_POWER_STATE : 12, ///< Host MCU power state [C]
    SPINEL_PROP_MCU_POWER_STATE  : 13, ///< NCP's MCU power state [c]

    SPINEL_PROP_BASE_EXT__BEGIN : 0x1000,

    /// GPIO Configuration
    /** Format: `A(CCU)`
     *  Type: Read-Only (Optionally Read-write using `CMD_PROP_VALUE_INSERT`)
     *
     * An array of structures which contain the following fields:
     *
     * *   `C`: GPIO Number
     * *   `C`: GPIO Configuration Flags
     * *   `U`: Human-readable GPIO name
     *
     * GPIOs which do not have a corresponding entry are not supported.
     *
     * The configuration parameter contains the configuration flags for the
     * GPIO:
     *
     *       0   1   2   3   4   5   6   7
     *     +---+---+---+---+---+---+---+---+
     *     |DIR|PUP|PDN|TRIGGER|  RESERVED |
     *     +---+---+---+---+---+---+---+---+
     *             |O/D|
     *             +---+
     *
     * *   `DIR`: Pin direction. Clear (0) for input, set (1) for output.
     * *   `PUP`: Pull-up enabled flag.
     * *   `PDN`/`O/D`: Flag meaning depends on pin direction:
     *     *   Input: Pull-down enabled.
     *     *   Output: Output is an open-drain.
     * *   `TRIGGER`: Enumeration describing how pin changes generate
     *     asynchronous notification commands (TBD) from the NCP to the host.
     *     *   0: Feature disabled for this pin
     *     *   1: Trigger on falling edge
     *     *   2: Trigger on rising edge
     *     *   3: Trigger on level change
     * *   `RESERVED`: Bits reserved for future use. Always cleared to zero
     *     and ignored when read.
     *
     * As an optional feature, the configuration of individual pins may be
     * modified using the `CMD_PROP_VALUE_INSERT` command. Only the GPIO
     * number and flags fields MUST be present, the GPIO name (if present)
     * would be ignored. This command can only be used to modify the
     * configuration of GPIOs which are already exposed---it cannot be used
     * by the host to add additional GPIOs.
     */
    SPINEL_PROP_GPIO_CONFIG : SPINEL_PROP_BASE_EXT__BEGIN + 0,

    /// GPIO State Bitmask
    /** Format: `D`
     *  Type: Read-Write
     *
     * Contains a bit field identifying the state of the GPIOs. The length of
     * the data associated with these properties depends on the number of
     * GPIOs. If you have 10 GPIOs, you'd have two bytes. GPIOs are numbered
     * from most significant bit to least significant bit, so 0x80 is GPIO 0,
     * 0x40 is GPIO 1, etc.
     *
     * For GPIOs configured as inputs:
     *
     * *   `CMD_PROP_VAUE_GET`: The value of the associated bit describes the
     *     logic level read from the pin.
     * *   `CMD_PROP_VALUE_SET`: The value of the associated bit is ignored
     *     for these pins.
     *
     * For GPIOs configured as outputs:
     *
     * *   `CMD_PROP_VAUE_GET`: The value of the associated bit is
     *     implementation specific.
     * *   `CMD_PROP_VALUE_SET`: The value of the associated bit determines
     *     the new logic level of the output. If this pin is configured as an
     *     open-drain, setting the associated bit to 1 will cause the pin to
     *     enter a Hi-Z state.
     *
     * For GPIOs which are not specified in `PROP_GPIO_CONFIG`:
     *
     * *   `CMD_PROP_VAUE_GET`: The value of the associated bit is
     *     implementation specific.
     * *   `CMD_PROP_VALUE_SET`: The value of the associated bit MUST be
     *     ignored by the NCP.
     *
     * When writing, unspecified bits are assumed to be zero.
     */
    SPINEL_PROP_GPIO_STATE : SPINEL_PROP_BASE_EXT__BEGIN + 2,

    /// GPIO State Set-Only Bitmask
    /** Format: `D`
     *  Type: Write-Only
     *
     * Allows for the state of various output GPIOs to be set without affecting
     * other GPIO states. Contains a bit field identifying the output GPIOs that
     * should have their state set to 1.
     *
     * When writing, unspecified bits are assumed to be zero. The value of
     * any bits for GPIOs which are not specified in `PROP_GPIO_CONFIG` MUST
     * be ignored.
     */
    SPINEL_PROP_GPIO_STATE_SET : SPINEL_PROP_BASE_EXT__BEGIN + 3,

    /// GPIO State Clear-Only Bitmask
    /** Format: `D`
     *  Type: Write-Only
     *
     * Allows for the state of various output GPIOs to be cleared without affecting
     * other GPIO states. Contains a bit field identifying the output GPIOs that
     * should have their state cleared to 0.
     *
     * When writing, unspecified bits are assumed to be zero. The value of
     * any bits for GPIOs which are not specified in `PROP_GPIO_CONFIG` MUST
     * be ignored.
     */
    SPINEL_PROP_GPIO_STATE_CLEAR : SPINEL_PROP_BASE_EXT__BEGIN + 4,

    /// 32-bit random number from TRNG, ready-to-use.
    SPINEL_PROP_TRNG_32 : SPINEL_PROP_BASE_EXT__BEGIN + 5,

    /// 16 random bytes from TRNG, ready-to-use.
    SPINEL_PROP_TRNG_128 : SPINEL_PROP_BASE_EXT__BEGIN + 6,

    /// Raw samples from TRNG entropy source representing 32 bits of entropy.
    SPINEL_PROP_TRNG_RAW_32 : SPINEL_PROP_BASE_EXT__BEGIN + 7,

    /// NCP Unsolicited update filter
    /** Format: `A(I)`
     *  Type: Read-Write (optional Insert-Remove)
     *  Required capability: `CAP_UNSOL_UPDATE_FILTER`
     *
     * Contains a list of properties which are excluded from generating
     * unsolicited value updates. This property is empty after reset.
     * In other words, the host may opt-out of unsolicited property updates
     * for a specific property by adding that property id to this list.
     * Hosts SHOULD NOT add properties to this list which are not
     * present in `PROP_UNSOL_UPDATE_LIST`. If such properties are added,
     * the NCP ignores the unsupported properties.
     */
    SPINEL_PROP_UNSOL_UPDATE_FILTER : SPINEL_PROP_BASE_EXT__BEGIN + 8,

    /// List of properties capable of generating unsolicited value update.
    /** Format: `A(I)`
     *  Type: Read-Only
     *  Required capability: `CAP_UNSOL_UPDATE_FILTER`
     *
     * Contains a list of properties which are capable of generating
     * unsolicited value updates. This list can be used when populating
     * `PROP_UNSOL_UPDATE_FILTER` to disable all unsolicited property
     * updates.
     *
     * This property is intended to effectively behave as a constant
     * for a given NCP firmware.
     */
    SPINEL_PROP_UNSOL_UPDATE_LIST : SPINEL_PROP_BASE_EXT__BEGIN + 9,

    SPINEL_PROP_BASE_EXT__END : 0x1100,

    SPINEL_PROP_PHY__BEGIN         : 0x20,
    SPINEL_PROP_PHY_ENABLED        : SPINEL_PROP_PHY__BEGIN + 0, ///< [b]
    SPINEL_PROP_PHY_CHAN           : SPINEL_PROP_PHY__BEGIN + 1, ///< [C]
    SPINEL_PROP_PHY_CHAN_SUPPORTED : SPINEL_PROP_PHY__BEGIN + 2, ///< [A(C)]
    SPINEL_PROP_PHY_FREQ           : SPINEL_PROP_PHY__BEGIN + 3, ///< kHz [L]
    SPINEL_PROP_PHY_CCA_THRESHOLD  : SPINEL_PROP_PHY__BEGIN + 4, ///< dBm [c]
    SPINEL_PROP_PHY_TX_POWER       : SPINEL_PROP_PHY__BEGIN + 5, ///< [c]
    SPINEL_PROP_PHY_RSSI           : SPINEL_PROP_PHY__BEGIN + 6, ///< dBm [c]
    SPINEL_PROP_PHY_RX_SENSITIVITY : SPINEL_PROP_PHY__BEGIN + 7, ///< dBm [c]
    SPINEL_PROP_PHY__END           : 0x30,

    SPINEL_PROP_PHY_EXT__BEGIN : 0x1200,

    /// Signal Jamming Detection Enable
    /** Format: `b`
     *
     * Indicates if jamming detection is enabled or disabled. Set to true
     * to enable jamming detection.
     */
    SPINEL_PROP_JAM_DETECT_ENABLE : SPINEL_PROP_PHY_EXT__BEGIN + 0,

    /// Signal Jamming Detected Indicator
    /** Format: `b` (Read-Only)
     *
     * Set to true if radio jamming is detected. Set to false otherwise.
     *
     * When jamming detection is enabled, changes to the value of this
     * property are emitted asynchronously via `CMD_PROP_VALUE_IS`.
     */
    SPINEL_PROP_JAM_DETECTED : SPINEL_PROP_PHY_EXT__BEGIN + 1,

    /// Jamming detection RSSI threshold
    /** Format: `c`
     *  Units: dBm
     *
     * This parameter describes the threshold RSSI level (measured in
     * dBm) above which the jamming detection will consider the
     * channel blocked.
     */
    SPINEL_PROP_JAM_DETECT_RSSI_THRESHOLD : SPINEL_PROP_PHY_EXT__BEGIN + 2,

    /// Jamming detection window size
    /** Format: `C`
     *  Units: Seconds (1-63)
     *
     * This parameter describes the window period for signal jamming
     * detection.
     */
    SPINEL_PROP_JAM_DETECT_WINDOW : SPINEL_PROP_PHY_EXT__BEGIN + 3,

    /// Jamming detection busy period
    /** Format: `C`
     *  Units: Seconds (1-63)
     *
     * This parameter describes the number of aggregate seconds within
     * the detection window where the RSSI must be above
     * `PROP_JAM_DETECT_RSSI_THRESHOLD` to trigger detection.
     *
     * The behavior of the jamming detection feature when `PROP_JAM_DETECT_BUSY`
     * is larger than `PROP_JAM_DETECT_WINDOW` is undefined.
     */
    SPINEL_PROP_JAM_DETECT_BUSY : SPINEL_PROP_PHY_EXT__BEGIN + 4,

    /// Jamming detection history bitmap (for debugging)
    /** Format: `X` (read-only)
     *
     * This value provides information about current state of jamming detection
     * module for monitoring/debugging purpose. It returns a 64-bit value where
     * each bit corresponds to one second interval starting with bit 0 for the
     * most recent interval and bit 63 for the oldest intervals (63 sec earlier).
     * The bit is set to 1 if the jamming detection module observed/detected
     * high signal level during the corresponding one second interval.
     *
     */
    SPINEL_PROP_JAM_DETECT_HISTORY_BITMAP : SPINEL_PROP_PHY_EXT__BEGIN + 5,

    /// Channel monitoring sample interval
    /** Format: `L` (read-only)
     *  Units: Milliseconds
     *
     * Required capability: SPINEL_CAP_CHANNEL_MONITOR
     *
     * If channel monitoring is enabled and active, every sample interval, a
     * zero-duration Energy Scan is performed, collecting a single RSSI sample
     * per channel. The RSSI samples are compared with a pre-specified RSSI
     * threshold.
     *
     */
    SPINEL_PROP_CHANNEL_MONITOR_SAMPLE_INTERVAL : SPINEL_PROP_PHY_EXT__BEGIN + 6,

    /// Channel monitoring RSSI threshold
    /** Format: `c` (read-only)
     *  Units: dBm
     *
     * Required capability: SPINEL_CAP_CHANNEL_MONITOR
     *
     * This value specifies the threshold used by channel monitoring module.
     * Channel monitoring maintains the average rate of RSSI samples that
     * are above the threshold within (approximately) a pre-specified number
     * of samples (sample window).
     *
     */
    SPINEL_PROP_CHANNEL_MONITOR_RSSI_THRESHOLD : SPINEL_PROP_PHY_EXT__BEGIN + 7,

    /// Channel monitoring sample window
    /** Format: `L` (read-only)
     *  Units: Number of samples
     *
     * Required capability: SPINEL_CAP_CHANNEL_MONITOR
     *
     * The averaging sample window length (in units of number of channel
     * samples) used by channel monitoring module. Channel monitoring will
     * sample all channels every sample interval. It maintains the average rate
     * of RSSI samples that are above the RSSI threshold within (approximately)
     * the sample window.
     *
     */
    SPINEL_PROP_CHANNEL_MONITOR_SAMPLE_WINDOW : SPINEL_PROP_PHY_EXT__BEGIN + 8,

    /// Channel monitoring sample count
    /** Format: `L` (read-only)
     *  Units: Number of samples
     *
     * Required capability: SPINEL_CAP_CHANNEL_MONITOR
     *
     * Total number of RSSI samples (per channel) taken by the channel
     * monitoring module since its start (since Thread network interface
     * was enabled).
     *
     */
    SPINEL_PROP_CHANNEL_MONITOR_SAMPLE_COUNT : SPINEL_PROP_PHY_EXT__BEGIN + 9,

    /// Channel monitoring channel occupancy
    /** Format: `A(t(CU))` (read-only)
     *
     * Required capability: SPINEL_CAP_CHANNEL_MONITOR
     *
     * Data per item is:
     *
     *  `C`: Channel
     *  `U`: Channel occupancy indicator
     *
     * The channel occupancy value represents the average rate/percentage of
     * RSSI samples that were above RSSI threshold ("bad" RSSI samples) within
     * (approximately) sample window latest RSSI samples.
     *
     * Max value of `0xffff` indicates all RSSI samples were above RSSI
     * threshold (i.e. 100% of samples were "bad").
     *
     */
    SPINEL_PROP_CHANNEL_MONITOR_CHANNEL_OCCUPANCY : SPINEL_PROP_PHY_EXT__BEGIN + 10,

    SPINEL_PROP_PHY_EXT__END : 0x1300,

    SPINEL_PROP_MAC__BEGIN             : 0x30,
    SPINEL_PROP_MAC_SCAN_STATE         : SPINEL_PROP_MAC__BEGIN + 0,  ///< [C]
    SPINEL_PROP_MAC_SCAN_MASK          : SPINEL_PROP_MAC__BEGIN + 1,  ///< [A(C)]
    SPINEL_PROP_MAC_SCAN_PERIOD        : SPINEL_PROP_MAC__BEGIN + 2,  ///< ms-per-channel [S]
    SPINEL_PROP_MAC_SCAN_BEACON        : SPINEL_PROP_MAC__BEGIN + 3,  ///< chan,rssi,mac_data,net_data [CcdD]
    SPINEL_PROP_MAC_15_4_LADDR         : SPINEL_PROP_MAC__BEGIN + 4,  ///< [E]
    SPINEL_PROP_MAC_15_4_SADDR         : SPINEL_PROP_MAC__BEGIN + 5,  ///< [S]
    SPINEL_PROP_MAC_15_4_PANID         : SPINEL_PROP_MAC__BEGIN + 6,  ///< [S]
    SPINEL_PROP_MAC_RAW_STREAM_ENABLED : SPINEL_PROP_MAC__BEGIN + 7,  ///< [C]
    SPINEL_PROP_MAC_PROMISCUOUS_MODE   : SPINEL_PROP_MAC__BEGIN + 8,  ///< [C]
    SPINEL_PROP_MAC_ENERGY_SCAN_RESULT : SPINEL_PROP_MAC__BEGIN + 9,  ///< chan,maxRssi [Cc]
    SPINEL_PROP_MAC_DATA_POLL_PERIOD   : SPINEL_PROP_MAC__BEGIN + 10, ///< pollPeriod (in ms) [L]
    SPINEL_PROP_MAC__END               : 0x40,

    SPINEL_PROP_MAC_EXT__BEGIN : 0x1300,
    /// MAC Whitelist
    /** Format: `A(t(Ec))`
     *
     * Structure Parameters:
     *
     * * `E`: EUI64 address of node
     * * `c`: Optional fixed RSSI. 127 means not set.
     */
    SPINEL_PROP_MAC_WHITELIST : SPINEL_PROP_MAC_EXT__BEGIN + 0,

    /// MAC Whitelist Enabled Flag
    /** Format: `b`
     */
    SPINEL_PROP_MAC_WHITELIST_ENABLED : SPINEL_PROP_MAC_EXT__BEGIN + 1,

    /// MAC Extended Address
    /** Format: `E`
     *
     *  Specified by Thread. Randomly-chosen, but non-volatile EUI-64.
     */
    SPINEL_PROP_MAC_EXTENDED_ADDR : SPINEL_PROP_MAC_EXT__BEGIN + 2,

    /// MAC Source Match Enabled Flag
    /** Format: `b`
     */
    SPINEL_PROP_MAC_SRC_MATCH_ENABLED : SPINEL_PROP_MAC_EXT__BEGIN + 3,

    /// MAC Source Match Short Address List
    /** Format: `A(S)`
     */
    SPINEL_PROP_MAC_SRC_MATCH_SHORT_ADDRESSES : SPINEL_PROP_MAC_EXT__BEGIN + 4,

    /// MAC Source Match Extended Address List
    /** Format: `A(E)`
     */
    SPINEL_PROP_MAC_SRC_MATCH_EXTENDED_ADDRESSES : SPINEL_PROP_MAC_EXT__BEGIN + 5,

    /// MAC Blacklist
    /** Format: `A(t(E))`
     *
     * Structure Parameters:
     *
     * * `E`: EUI64 address of node
     */
    SPINEL_PROP_MAC_BLACKLIST : SPINEL_PROP_MAC_EXT__BEGIN + 6,

    /// MAC Blacklist Enabled Flag
    /** Format: `b`
     */
    SPINEL_PROP_MAC_BLACKLIST_ENABLED : SPINEL_PROP_MAC_EXT__BEGIN + 7,

    /// MAC Received Signal Strength Filter
    /** Format: `A(t(Ec))`
     *
     * Structure Parameters:
     *
     * * `E`: Optional EUI64 address of node. Set default RSS if not included.
     * * `c`: Fixed RSS. OT_MAC_FILTER_FIXED_RSS_OVERRIDE_DISABLED(127) means not set.
     */
    SPINEL_PROP_MAC_FIXED_RSS : SPINEL_PROP_MAC_EXT__BEGIN + 8,

    /// The CCA failure rate
    /** Format: `S`
     *
     * This property provides the current CCA (Clear Channel Assessment) failure rate.
     *
     * Maximum value `0xffff` corresponding to 100% failure rate.
     *
     */
    SPINEL_PROP_MAC_CCA_FAILURE_RATE : SPINEL_PROP_MAC_EXT__BEGIN + 9,

    SPINEL_PROP_MAC_EXT__END : 0x1400,

    SPINEL_PROP_NET__BEGIN               : 0x40,
    SPINEL_PROP_NET_SAVED                : SPINEL_PROP_NET__BEGIN + 0, ///< [b]
    SPINEL_PROP_NET_IF_UP                : SPINEL_PROP_NET__BEGIN + 1, ///< [b]
    SPINEL_PROP_NET_STACK_UP             : SPINEL_PROP_NET__BEGIN + 2, ///< [b]
    SPINEL_PROP_NET_ROLE                 : SPINEL_PROP_NET__BEGIN + 3, ///< [C]
    SPINEL_PROP_NET_NETWORK_NAME         : SPINEL_PROP_NET__BEGIN + 4, ///< [U]
    SPINEL_PROP_NET_XPANID               : SPINEL_PROP_NET__BEGIN + 5, ///< [D]
    SPINEL_PROP_NET_MASTER_KEY           : SPINEL_PROP_NET__BEGIN + 6, ///< [D]
    SPINEL_PROP_NET_KEY_SEQUENCE_COUNTER : SPINEL_PROP_NET__BEGIN + 7, ///< [L]
    SPINEL_PROP_NET_PARTITION_ID         : SPINEL_PROP_NET__BEGIN + 8, ///< [L]

    /// Require Join Existing
    /** Format: `b`
     *  Default Value: `false`
     *
     * This flag is typically used for nodes that are associating with an
     * existing network for the first time. If this is set to `true` before
     * `PROP_NET_STACK_UP` is set to `true`, the
     * creation of a new partition at association is prevented. If the node
     * cannot associate with an existing partition, `PROP_LAST_STATUS` will
     * emit a status that indicates why the association failed and
     * `PROP_NET_STACK_UP` will automatically revert to `false`.
     *
     * Once associated with an existing partition, this flag automatically
     * reverts to `false`.
     *
     * The behavior of this property being set to `true` when
     * `PROP_NET_STACK_UP` is already set to `true` is undefined.
     */
    SPINEL_PROP_NET_REQUIRE_JOIN_EXISTING : SPINEL_PROP_NET__BEGIN + 9,

    SPINEL_PROP_NET_KEY_SWITCH_GUARDTIME : SPINEL_PROP_NET__BEGIN + 10, ///< [L]

    SPINEL_PROP_NET_PSKC : SPINEL_PROP_NET__BEGIN + 11, ///< [D]

    SPINEL_PROP_NET__END : 0x50,

    SPINEL_PROP_NET_EXT__BEGIN : 0x1400,
    SPINEL_PROP_NET_EXT__END   : 0x1500,

    SPINEL_PROP_THREAD__BEGIN      : 0x50,
    SPINEL_PROP_THREAD_LEADER_ADDR : SPINEL_PROP_THREAD__BEGIN + 0, ///< [6]

    /// Thread Parent Info
    /** Format: `ESLccCC` - Read only
     *
     *  `E`: Extended address
     *  `S`: RLOC16
     *  `L`: Age (seconds since last heard from)
     *  `c`: Average RSS (in dBm)
     *  `c`: Last RSSI (in dBm)
     *  `C`: Link Quality In
     *  `C`: Link Quality Out
     *
     */
    SPINEL_PROP_THREAD_PARENT : SPINEL_PROP_THREAD__BEGIN + 1,

    /// Thread Child Table
    /** Format: [A(t(ESLLCCcCc)] - Read only
     *
     * Data per item is:
     *
     *  `E`: Extended address
     *  `S`: RLOC16
     *  `L`: Timeout (in seconds)
     *  `L`: Age (in seconds)
     *  `L`: Network Data version
     *  `C`: Link Quality In
     *  `c`: Average RSS (in dBm)
     *  `C`: Mode (bit-flags)
     *  `c`: Last RSSI (in dBm)
     *
     */
    SPINEL_PROP_THREAD_CHILD_TABLE                 : SPINEL_PROP_THREAD__BEGIN + 2,
    SPINEL_PROP_THREAD_LEADER_RID                  : SPINEL_PROP_THREAD__BEGIN + 3, ///< [C]
    SPINEL_PROP_THREAD_LEADER_WEIGHT               : SPINEL_PROP_THREAD__BEGIN + 4, ///< [C]
    SPINEL_PROP_THREAD_LOCAL_LEADER_WEIGHT         : SPINEL_PROP_THREAD__BEGIN + 5, ///< [C]
    SPINEL_PROP_THREAD_NETWORK_DATA                : SPINEL_PROP_THREAD__BEGIN + 6, ///< [D]
    SPINEL_PROP_THREAD_NETWORK_DATA_VERSION        : SPINEL_PROP_THREAD__BEGIN + 7, ///< [S]
    SPINEL_PROP_THREAD_STABLE_NETWORK_DATA         : SPINEL_PROP_THREAD__BEGIN + 8, ///< [D]
    SPINEL_PROP_THREAD_STABLE_NETWORK_DATA_VERSION : SPINEL_PROP_THREAD__BEGIN + 9, ///< [S]

    /// On-Mesh Prefixes
    /** Format: `A(t(6CbCbS))`
     *
     * Data per item is:
     *
     *  `6`: IPv6 Prefix
     *  `C`: Prefix length in bits
     *  `b`: Stable flag
     *  `C`: TLV flags
     *  `b`: "Is defined locally" flag. Set if this network was locally
     *       defined. Assumed to be true for set, insert and replace. Clear if
     *       the on mesh network was defined by another node.
     *  `S`: The RLOC16 of the device that registered this on-mesh prefix entry.
     *       This value is not used and ignored when adding an on-mesh prefix.
     *
     */
    SPINEL_PROP_THREAD_ON_MESH_NETS : SPINEL_PROP_THREAD__BEGIN + 10,

    /// Off-mesh routes
    /** Format: [A(t(6CbCbb))]
     *
     * Data per item is:
     *
     *  `6`: Route Prefix
     *  `C`: Prefix length in bits
     *  `b`: Stable flag
     *  `C`: Route preference flags
     *  `b`: "Is defined locally" flag. Set if this route info was locally
     *       defined as part of local network data. Assumed to be true for set,
     *       insert and replace. Clear if the route is part of partition's network
     *       data.
     *  `b`: "Next hop is this device" flag. Set if the next hop for the
     *       route is this device itself (i.e., route was added by this device)
     *       This value is ignored when adding an external route. For any added
     *       route the next hop is this device.
     *  `S`: The RLOC16 of the device that registered this route entry.
     *       This value is not used and ignored when adding a route.
     *
     */
    SPINEL_PROP_THREAD_OFF_MESH_ROUTES : SPINEL_PROP_THREAD__BEGIN + 11,

    SPINEL_PROP_THREAD_ASSISTING_PORTS             : SPINEL_PROP_THREAD__BEGIN + 12, ///< array(portn) [A(S)]
    SPINEL_PROP_THREAD_ALLOW_LOCAL_NET_DATA_CHANGE : SPINEL_PROP_THREAD__BEGIN + 13, ///< [b]

    /// Thread Mode
    /** Format: `C`
     *
     *  This property contains the value of the mode
     *  TLV for this node. The meaning of the bits in this
     *  bitfield are defined by section 4.5.2 of the Thread
     *  specification.
     */
    SPINEL_PROP_THREAD_MODE : SPINEL_PROP_THREAD__BEGIN + 14,
    SPINEL_PROP_THREAD__END : 0x60,

    SPINEL_PROP_THREAD_EXT__BEGIN : 0x1500,

    /// Thread Child Timeout
    /** Format: `L`
     *
     *  Used when operating in the Child role.
     */
    SPINEL_PROP_THREAD_CHILD_TIMEOUT : SPINEL_PROP_THREAD_EXT__BEGIN + 0,

    /// Thread RLOC16
    /** Format: `S`
     */
    SPINEL_PROP_THREAD_RLOC16 : SPINEL_PROP_THREAD_EXT__BEGIN + 1,

    /// Thread Router Upgrade Threshold
    /** Format: `C`
     */
    SPINEL_PROP_THREAD_ROUTER_UPGRADE_THRESHOLD : SPINEL_PROP_THREAD_EXT__BEGIN + 2,

    /// Thread Context Reuse Delay
    /** Format: `L`
     */
    SPINEL_PROP_THREAD_CONTEXT_REUSE_DELAY : SPINEL_PROP_THREAD_EXT__BEGIN + 3,

    /// Thread Network ID Timeout
    /** Format: `C`
     */
    SPINEL_PROP_THREAD_NETWORK_ID_TIMEOUT : SPINEL_PROP_THREAD_EXT__BEGIN + 4,

    /// List of active thread router ids
    /** Format: `A(C)`
     *
     * Note that some implementations may not support CMD_GET_VALUE
     * routerids, but may support CMD_REMOVE_VALUE when the node is
     * a leader.
     */
    SPINEL_PROP_THREAD_ACTIVE_ROUTER_IDS : SPINEL_PROP_THREAD_EXT__BEGIN + 5,

    /// Forward IPv6 packets that use RLOC16 addresses to HOST.
    /** Format: `b`
     */
    SPINEL_PROP_THREAD_RLOC16_DEBUG_PASSTHRU : SPINEL_PROP_THREAD_EXT__BEGIN + 6,

    /// This property indicates whether or not the `Router Role` is enabled.
    /** Format `b`
     */
    SPINEL_PROP_THREAD_ROUTER_ROLE_ENABLED : SPINEL_PROP_THREAD_EXT__BEGIN + 7,

    /// Thread Router Downgrade Threshold
    /** Format: `C`
     */
    SPINEL_PROP_THREAD_ROUTER_DOWNGRADE_THRESHOLD : SPINEL_PROP_THREAD_EXT__BEGIN + 8,

    /// Thread Router Selection Jitter
    /** Format: `C`
     */
    SPINEL_PROP_THREAD_ROUTER_SELECTION_JITTER : SPINEL_PROP_THREAD_EXT__BEGIN + 9,

    /// Thread Preferred Router Id
    /** Format: `C` - Write only
     */
    SPINEL_PROP_THREAD_PREFERRED_ROUTER_ID : SPINEL_PROP_THREAD_EXT__BEGIN + 10,

    /// Thread Neighbor Table
    /** Format: `A(t(ESLCcCbLLc))` - Read only
     *
     * Data per item is:
     *
     *  `E`: Extended address
     *  `S`: RLOC16
     *  `L`: Age (in seconds)
     *  `C`: Link Quality In
     *  `c`: Average RSS (in dBm)
     *  `C`: Mode (bit-flags)
     *  `b`: `true` if neighbor is a child, `false` otherwise.
     *  `L`: Link Frame Counter
     *  `L`: MLE Frame Counter
     *  `c`: The last RSSI (in dBm)
     *
     */
    SPINEL_PROP_THREAD_NEIGHBOR_TABLE : SPINEL_PROP_THREAD_EXT__BEGIN + 11,

    /// Thread Max Child Count
    /** Format: `C`
     */
    SPINEL_PROP_THREAD_CHILD_COUNT_MAX : SPINEL_PROP_THREAD_EXT__BEGIN + 12,

    /// Leader network data
    /** Format: `D` - Read only
     */
    SPINEL_PROP_THREAD_LEADER_NETWORK_DATA : SPINEL_PROP_THREAD_EXT__BEGIN + 13,

    /// Stable leader network data
    /** Format: `D` - Read only
     */
    SPINEL_PROP_THREAD_STABLE_LEADER_NETWORK_DATA : SPINEL_PROP_THREAD_EXT__BEGIN + 14,

    /// Thread joiner data
    /** Format `A(T(ULE))`
     *  PSKd, joiner timeout, eui64 (optional)
     *
     * This property is being deprecated by SPINEL_PROP_MESHCOP_COMMISSIONER_JOINERS.
     *
     */
    SPINEL_PROP_THREAD_JOINERS : SPINEL_PROP_THREAD_EXT__BEGIN + 15,

    /// Thread commissioner enable
    /** Format `b`
     *
     * Default value is `false`.
     *
     * This property is being deprecated by SPINEL_PROP_MESHCOP_COMMISSIONER_STATE.
     *
     */
    SPINEL_PROP_THREAD_COMMISSIONER_ENABLED : SPINEL_PROP_THREAD_EXT__BEGIN + 16,

    /// Thread TMF proxy enable
    /** Format `b`
     * Required capability: `SPINEL_CAP_THREAD_TMF_PROXY`
     *
     * This property is deprecated.
     *
     */
    SPINEL_PROP_THREAD_TMF_PROXY_ENABLED : SPINEL_PROP_THREAD_EXT__BEGIN + 17,

    /// Thread TMF proxy stream
    /** Format `dSS`
     * Required capability: `SPINEL_CAP_THREAD_TMF_PROXY`
     *
     * This property is deprecated. Please see `SPINEL_PROP_THREAD_UDP_PROXY_STREAM`.
     *
     */
    SPINEL_PROP_THREAD_TMF_PROXY_STREAM : SPINEL_PROP_THREAD_EXT__BEGIN + 18,

    /// Thread "joiner" flag used during discovery scan operation
    /** Format `b`
     *
     * This property defines the Joiner Flag value in the Discovery Request TLV.
     *
     * Default value is `false`.
     */
    SPINEL_PROP_THREAD_DISCOVERY_SCAN_JOINER_FLAG : SPINEL_PROP_THREAD_EXT__BEGIN + 19,

    /// Enable EUI64 filtering for discovery scan operation.
    /** Format `b`
     *
     * Default value is `false`
     */
    SPINEL_PROP_THREAD_DISCOVERY_SCAN_ENABLE_FILTERING : SPINEL_PROP_THREAD_EXT__BEGIN + 20,

    /// PANID used for Discovery scan operation (used for PANID filtering).
    /** Format: `S`
     *
     * Default value is 0xffff (Broadcast PAN) to disable PANID filtering
     *
     */
    SPINEL_PROP_THREAD_DISCOVERY_SCAN_PANID : SPINEL_PROP_THREAD_EXT__BEGIN + 21,

    /// Thread (out of band) steering data for MLE Discovery Response.
    /** Format `E` - Write only
     *
     * Required capability: SPINEL_CAP_OOB_STEERING_DATA.
     *
     * Writing to this property allows to set/update the MLE Discovery Response steering data out of band.
     *
     *  - All zeros to clear the steering data (indicating that there is no steering data).
     *  - All 0xFFs to set steering data/bloom filter to accept/allow all.
     *  - A specific EUI64 which is then added to current steering data/bloom filter.
     *
     */
    SPINEL_PROP_THREAD_STEERING_DATA : SPINEL_PROP_THREAD_EXT__BEGIN + 22,

    /// Thread Router Table.
    /** Format: `A(t(ESCCCCCCb)` - Read only
     *
     * Data per item is:
     *
     *  `E`: IEEE 802.15.4 Extended Address
     *  `S`: RLOC16
     *  `C`: Router ID
     *  `C`: Next hop to router
     *  `C`: Path cost to router
     *  `C`: Link Quality In
     *  `C`: Link Quality Out
     *  `C`: Age (seconds since last heard)
     *  `b`: Link established with Router ID or not.
     *
     */
    SPINEL_PROP_THREAD_ROUTER_TABLE : SPINEL_PROP_THREAD_EXT__BEGIN + 23,

    /// Thread Active Operational Dataset
    /** Format: `A(t(iD))` - Read-Write
     *
     * This property provides access to current Thread Active Operational Dataset. A Thread device maintains the
     * Operational Dataset that it has stored locally and the one currently in use by the partition to which it is
     * attached. This property corresponds to the locally stored Dataset on the device.
     *
     * Operational Dataset consists of a set of supported properties (e.g., channel, master key, network name, PAN id,
     * etc). Note that not all supported properties may be present (have a value) in a Dataset.
     *
     * The Dataset value is encoded as an array of structs containing pairs of property key (as `i`) followed by the
     * property value (as `D`). The property value must follow the format associated with the corresponding property.
     *
     * On write, any unknown/unsupported property keys must be ignored.
     *
     * The following properties can be included in a Dataset list:
     *
     *   SPINEL_PROP_DATASET_ACTIVE_TIMESTAMP
     *   SPINEL_PROP_PHY_CHAN
     *   SPINEL_PROP_PHY_CHAN_SUPPORTED (Channel Mask Page 0)
     *   SPINEL_PROP_NET_MASTER_KEY
     *   SPINEL_PROP_NET_NETWORK_NAME
     *   SPINEL_PROP_NET_XPANID
     *   SPINEL_PROP_MAC_15_4_PANID
     *   SPINEL_PROP_IPV6_ML_PREFIX
     *   SPINEL_PROP_NET_PSKC
     *   SPINEL_PROP_DATASET_SECURITY_POLICY
     *
     */
    SPINEL_PROP_THREAD_ACTIVE_DATASET : SPINEL_PROP_THREAD_EXT__BEGIN + 24,

    /// Thread Pending Operational Dataset
    /** Format: `A(t(iD))` - Read-Write
     *
     * This property provide access to current locally stored Pending Operational Dataset.
     *
     * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_ACTIVE_DATASET.
     *
     * In addition supported properties in SPINEL_PROP_THREAD_ACTIVE_DATASET, the following properties can also
     * be included in the Pending Dataset:
     *
     *   SPINEL_PROP_DATASET_PENDING_TIMESTAMP
     *   SPINEL_PROP_DATASET_DELAY_TIMER
     *
     */
    SPINEL_PROP_THREAD_PENDING_DATASET : SPINEL_PROP_THREAD_EXT__BEGIN + 25,

    /// Send MGMT_SET Thread Active Operational Dataset
    /** Format: `A(t(iD))` - Write only
     *
     * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_ACTIVE_DATASET.
     *
     * This is write-only property. When written, it triggers a MGMT_ACTIVE_SET meshcop command to be sent to leader
     * with the given Dataset. The spinel frame response should be a `LAST_STATUS` with the status of the transmission
     * of MGMT_ACTIVE_SET command.
     *
     * In addition to supported properties in SPINEL_PROP_THREAD_ACTIVE_DATASET, the following property can be
     * included in the Dataset (to allow for custom raw TLVs):
     *
     *    SPINEL_PROP_DATASET_RAW_TLVS
     *
     */
    SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET : SPINEL_PROP_THREAD_EXT__BEGIN + 26,

    /// Send MGMT_SET Thread Pending Operational Dataset
    /** Format: `A(t(iD))` - Write only
     *
     * This property is similar to SPINEL_PROP_THREAD_PENDING_DATASET and follows the same format and rules.
     *
     * In addition to supported properties in SPINEL_PROP_THREAD_PENDING_DATASET, the following property can be
     * included the Dataset (to allow for custom raw TLVs to be provided).
     *
     *    SPINEL_PROP_DATASET_RAW_TLVS
     *
     */
    SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET : SPINEL_PROP_THREAD_EXT__BEGIN + 27,

    /// Operational Dataset Active Timestamp
    /** Format: `X` - No direct read or write
     *
     * It can only be included in one of the Dataset related properties below:
     *
     *   SPINEL_PROP_THREAD_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
     *
     */
    SPINEL_PROP_DATASET_ACTIVE_TIMESTAMP : SPINEL_PROP_THREAD_EXT__BEGIN + 28,

    /// Operational Dataset Pending Timestamp
    /** Format: `X` - No direct read or write
     *
     * It can only be included in one of the Pending Dataset properties:
     *
     *   SPINEL_PROP_THREAD_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
     *
     */
    SPINEL_PROP_DATASET_PENDING_TIMESTAMP : SPINEL_PROP_THREAD_EXT__BEGIN + 29,

    /// Operational Dataset Delay Timer
    /** Format: `L` - No direct read or write
     *
     * Delay timer (in ms) specifies the time renaming until Thread devices overwrite the value in the Active
     * Operational Dataset with the corresponding values in the Pending Operational Dataset.
     *
     * It can only be included in one of the Pending Dataset properties:
     *
     *   SPINEL_PROP_THREAD_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
     *
     */
    SPINEL_PROP_DATASET_DELAY_TIMER : SPINEL_PROP_THREAD_EXT__BEGIN + 30,

    /// Operational Dataset Security Policy
    /** Format: `SC` - No direct read or write
     *
     * It can only be included in one of the Dataset related properties below:
     *
     *   SPINEL_PROP_THREAD_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
     *
     * Content is
     *   `S` : Key Rotation Time (in units of hour)
     *   `C` : Security Policy Flags (as specified in Thread 1.1 Section 8.10.1.15)
     *
     */
    SPINEL_PROP_DATASET_SECURITY_POLICY : SPINEL_PROP_THREAD_EXT__BEGIN + 31,

    /// Operational Dataset Additional Raw TLVs
    /** Format: `D` - No direct read or write
     *
     * This property defines extra raw TLVs that can be added to an Operational DataSet.
     *
     * It can only be included in one of the following Dataset properties:
     *
     *   SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_MGMT_SET_PENDING_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
     *
     */
    SPINEL_PROP_DATASET_RAW_TLVS : SPINEL_PROP_THREAD_EXT__BEGIN + 32,

    /// Child table addresses
    /** Format: `A(t(ESA(6)))` - Read only
     *
     * This property provides the list of all addresses associated with every child
     * including any registered IPv6 addresses.
     *
     * Data per item is:
     *
     *  `E`: Extended address of the child
     *  `S`: RLOC16 of the child
     *  `A(6)`: List of IPv6 addresses registered by the child (if any)
     *
     */
    SPINEL_PROP_THREAD_CHILD_TABLE_ADDRESSES : SPINEL_PROP_THREAD_EXT__BEGIN + 33,

    /// Neighbor Table Frame and Message Error Rates
    /** Format: `A(t(ESSScc))`
     *  Required capability: `CAP_ERROR_RATE_TRACKING`
     *
     * This property provides link quality related info including
     * frame and (IPv6) message error rates for all neighbors.
     *
     * With regards to message error rate, note that a larger (IPv6)
     * message can be fragmented and sent as multiple MAC frames. The
     * message transmission is considered a failure, if any of its
     * fragments fail after all MAC retry attempts.
     *
     * Data per item is:
     *
     *  `E`: Extended address of the neighbor
     *  `S`: RLOC16 of the neighbor
     *  `S`: Frame error rate (0 -> 0%, 0xffff -> 100%)
     *  `S`: Message error rate (0 -> 0%, 0xffff -> 100%)
     *  `c`: Average RSSI (in dBm)
     *  `c`: Last RSSI (in dBm)
     *
     */
    SPINEL_PROP_THREAD_NEIGHBOR_TABLE_ERROR_RATES : SPINEL_PROP_THREAD_EXT__BEGIN + 34,

    /// EID (Endpoint Identifier) IPv6 Address Cache Table
    /** Format `A(t(6SC))`
     *
     * This property provides Thread EID address cache table.
     *
     * Data per item is:
     *
     *  `6` : Target IPv6 address
     *  `S` : RLOC16 of target
     *  `C` : Age (order of use, 0 indicates most recently used entry)
     *
     */
    SPINEL_PROP_THREAD_ADDRESS_CACHE_TABLE : SPINEL_PROP_THREAD_EXT__BEGIN + 35,

    /// Thread UDP proxy stream
    /** Format `dS6S`
     * Required capability: `SPINEL_CAP_THREAD_UDP_PROXY`
     *
     * This property helps exchange UDP packets with host.
     *
     *  `d`: UDP payload
     *  `S`: Remote UDP port
     *  `6`: Remote IPv6 address
     *  `S`: Local UDP port
     *
     */
    SPINEL_PROP_THREAD_UDP_PROXY_STREAM : SPINEL_PROP_THREAD_EXT__BEGIN + 36,

    /// Send MGMT_GET Thread Active Operational Dataset
    /** Format: `A(t(iD))` - Write only
     *
     * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET. This
     * property further allows the sender to not include a value associated with properties in formating of `t(iD)`,
     * i.e., it should accept either a `t(iD)` or a `t(i)` encoding (in both cases indicating that the associated
     * Dataset property should be requested as part of MGMT_GET command).
     *
     * This is write-only property. When written, it triggers a MGMT_ACTIVE_GET meshcop command to be sent to leader
     * requesting the Dataset related properties from the format. The spinel frame response should be a `LAST_STATUS`
     * with the status of the transmission of MGMT_ACTIVE_GET command.
     *
     * In addition to supported properties in SPINEL_PROP_THREAD_MGMT_SET_ACTIVE_DATASET, the following property can be
     * optionally included in the Dataset:
     *
     *    SPINEL_PROP_DATASET_DEST_ADDRESS
     *
     */
    SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET : SPINEL_PROP_THREAD_EXT__BEGIN + 37,

    /// Send MGMT_GET Thread Pending Operational Dataset
    /** Format: `A(t(iD))` - Write only
     *
     * The formatting of this property follows the same rules as in SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET.
     *
     * This is write-only property. When written, it triggers a MGMT_PENDING_GET meshcop command to be sent to leader
     * with the given Dataset. The spinel frame response should be a `LAST_STATUS` with the status of the transmission
     * of MGMT_PENDING_GET command.
     *
     */
    SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET : SPINEL_PROP_THREAD_EXT__BEGIN + 38,

    /// Operational Dataset (MGMT_GET) Destination IPv6 Address
    /** Format: `6` - No direct read or write
     *
     * This property specifies the IPv6 destination when sending MGMT_GET command for either Active or Pending Dataset
     * if not provided, Leader ALOC address is used as default.
     *
     * It can only be included in one of the MGMT_GET Dataset properties:
     *
     *   SPINEL_PROP_THREAD_MGMT_GET_ACTIVE_DATASET
     *   SPINEL_PROP_THREAD_MGMT_GET_PENDING_DATASET
     *
     */
    SPINEL_PROP_DATASET_DEST_ADDRESS : SPINEL_PROP_THREAD_EXT__BEGIN + 39,

    SPINEL_PROP_THREAD_EXT__END : 0x1600,

    SPINEL_PROP_IPV6__BEGIN    : 0x60,
    SPINEL_PROP_IPV6_LL_ADDR   : SPINEL_PROP_IPV6__BEGIN + 0, ///< [6]
    SPINEL_PROP_IPV6_ML_ADDR   : SPINEL_PROP_IPV6__BEGIN + 1, ///< [6C]
    SPINEL_PROP_IPV6_ML_PREFIX : SPINEL_PROP_IPV6__BEGIN + 2, ///< [6C]

    /// IPv6 Address Table
    /** Format: `A(t(6CLLC))`
     *
     * This property provides all unicast addresses.
     *
     * Array of structures containing:
     *
     *  `6`: IPv6 Address
     *  `C`: Network Prefix Length
     *  `L`: Valid Lifetime
     *  `L`: Preferred Lifetime
     *  `C`: Flags
     *
     */
    SPINEL_PROP_IPV6_ADDRESS_TABLE : SPINEL_PROP_IPV6__BEGIN + 3,

    SPINEL_PROP_IPV6_ROUTE_TABLE :
        SPINEL_PROP_IPV6__BEGIN + 4, ///< array(ipv6prefix,prefixlen,iface,flags) [A(t(6CCC))]

    /// IPv6 ICMP Ping Offload
    /** Format: `b`
     *
     * Allow the NCP to directly respond to ICMP ping requests. If this is
     * turned on, ping request ICMP packets will not be passed to the host.
     *
     * Default value is `false`.
     */
    SPINEL_PROP_IPV6_ICMP_PING_OFFLOAD : SPINEL_PROP_IPV6__BEGIN + 5, ///< [b]

    SPINEL_PROP_IPV6_MULTICAST_ADDRESS_TABLE : SPINEL_PROP_IPV6__BEGIN + 6, ///< [A(t(6))]

    /// IPv6 ICMP Ping Offload
    /** Format: `C`
     *
     * Allow the NCP to directly respond to ICMP ping requests. If this is
     * turned on, ping request ICMP packets will not be passed to the host.
     *
     * This property allows enabling responses sent to unicast only, multicast
     * only, or both.
     *
     * Default value is `NET_IPV6_ICMP_PING_OFFLOAD_DISABLED`.
     */
    SPINEL_PROP_IPV6_ICMP_PING_OFFLOAD_MODE : SPINEL_PROP_IPV6__BEGIN + 7, ///< [b]

    SPINEL_PROP_IPV6__END : 0x70,

    SPINEL_PROP_IPV6_EXT__BEGIN : 0x1600,
    SPINEL_PROP_IPV6_EXT__END   : 0x1700,

    SPINEL_PROP_STREAM__BEGIN       : 0x70,
    SPINEL_PROP_STREAM_DEBUG        : SPINEL_PROP_STREAM__BEGIN + 0, ///< [U]
    SPINEL_PROP_STREAM_RAW          : SPINEL_PROP_STREAM__BEGIN + 1, ///< [dD]
    SPINEL_PROP_STREAM_NET          : SPINEL_PROP_STREAM__BEGIN + 2, ///< [dD]
    SPINEL_PROP_STREAM_NET_INSECURE : SPINEL_PROP_STREAM__BEGIN + 3, ///< [dD]

    /// Log Stream
    /** Format: `UD` (stream, read only)
     *
     * This property is a read-only streaming property which provides
     * formatted log string from NCP. This property provides asynchronous
     * `CMD_PROP_VALUE_IS` updates with a new log string and includes
     * optional meta data.
     *
     *   `U`: The log string
     *   `D`: Log metadata (optional).
     *
     * Any data after the log string is considered metadata and is OPTIONAL.
     * Pretense of `SPINEL_CAP_OPENTHREAD_LOG_METADATA` capability
     * indicates that OpenThread log metadata format is used as defined
     * below:
     *
     *    `C`: Log level (as per definition in enumeration
     *         `SPINEL_NCP_LOG_LEVEL_<level>`)
     *    `i`: OpenThread Log region (as per definition in enumeration
     *         `SPINEL_NCP_LOG_REGION_<region>).
     *
     */
    SPINEL_PROP_STREAM_LOG  : SPINEL_PROP_STREAM__BEGIN + 4,
    SPINEL_PROP_STREAM__END : 0x80,

    SPINEL_PROP_STREAM_EXT__BEGIN : 0x1700,
    SPINEL_PROP_STREAM_EXT__END   : 0x1800,

    SPINEL_PROP_MESHCOP__BEGIN : 0x80,

    // Thread Joiner State
    /** Format `C` - Read Only
     *
     * Required capability: SPINEL_CAP_THREAD_JOINER
     *
     * The valid values are specified by SPINEL_MESHCOP_COMMISIONER_STATE_<state> enumeration.
     *
     */
    SPINEL_PROP_MESHCOP_JOINER_STATE : SPINEL_PROP_MESHCOP__BEGIN + 0, ///<[C]

    /// Thread Joiner Commissioning command and the parameters
    /** Format `bUU` - Write Only
     *
     * This property starts or stops Joiner's commissioning process
     *
     * Required capability: SPINEL_CAP_THREAD_JOINER
     *
     * Writing to this property starts/stops the Joiner commissioning process.
     * The immediate `VALUE_IS` response indicates success/failure of the starting/stopping
     * the Joiner commissioning process.
     *
     * After a successful start operation, the join process outcome is reported through an
     * asynchronous `VALUE_IS(LAST_STATUS)`  update with one of the following error status values:
     *
     *     - SPINEL_STATUS_JOIN_SUCCESS     the join process succeeded.
     *     - SPINEL_STATUS_JOIN_SECURITY    the join process failed due to security credentials.
     *     - SPINEL_STATUS_JOIN_NO_PEERS    no joinable network was discovered.
     *     - SPINEL_STATUS_JOIN_RSP_TIMEOUT if a response timed out.
     *     - SPINEL_STATUS_JOIN_FAILURE     join failure.
     *
     * Data per item is:
     *
     *  `b` : Start or stop commissioning process
     *  `U` : Joiner's PSKd if start commissioning, empty string if stop commissioning
     *  `U` : Provisioning url if start commissioning, empty string if stop commissioning
     *
     */
    SPINEL_PROP_MESHCOP_JOINER_COMMISSIONING : SPINEL_PROP_MESHCOP__BEGIN + 1,

    // Thread Commissioner State
    /** Format `C`
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * The valid values are specified by SPINEL_MESHCOP_COMMISIONER_STATE_<state> enumeration.
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_STATE : SPINEL_PROP_MESHCOP__BEGIN + 2,

    // Thread Commissioner Joiners
    /** Format `A(t(E)UL)` - insert or remove only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * Data per item is:
     *
     *  `t(E)` | `t()`: Joiner EUI64. Empty struct indicates any Joiner
     *  `L`           : Timeout (in seconds) after which the Joiner is automatically removed
     *  `U`           : PSKd
     *
     * For CMD_PROP_VALUE_REMOVE the timeout and PSKd are optional.
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_JOINERS : SPINEL_PROP_MESHCOP__BEGIN + 3,

    // Thread Commissioner Provisioning URL
    /** Format `U`
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_PROVISIONING_URL : SPINEL_PROP_MESHCOP__BEGIN + 4,

    // Thread Commissioner Session ID
    /** Format `S` - Read only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_SESSION_ID : SPINEL_PROP_MESHCOP__BEGIN + 5,

    SPINEL_PROP_MESHCOP__END : 0x90,

    SPINEL_PROP_MESHCOP_EXT__BEGIN : 0x1800,

    // Thread Commissioner Announce Begin
    /** Format `LCS6` - Write only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * Writing to this property sends an Announce Begin message with the specified parameters. Response is a
     * `LAST_STATUS` update with status of operation.
     *
     *   `L` : Channel mask
     *   `C` : Number of messages per channel
     *   `S` : The time between two successive MLE Announce transmissions (milliseconds)
     *   `6` : IPv6 destination
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_ANNOUNCE_BEGIN : SPINEL_PROP_MESHCOP_EXT__BEGIN + 0,

    // Thread Commissioner Energy Scan Query
    /** Format `LCSS6` - Write only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * Writing to this property sends an Energy Scan Query message with the specified parameters. Response is a
     * `LAST_STATUS` with status of operation. The energy scan results are emitted asynchronously through
     * `SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN_RESULT` updates.
     *
     * Format is:
     *
     *   `L` : Channel mask
     *   `C` : The number of energy measurements per channel
     *   `S` : The time between energy measurements (milliseconds)
     *   `S` : The scan duration for each energy measurement (milliseconds)
     *   `6` : IPv6 destination.
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN : SPINEL_PROP_MESHCOP_EXT__BEGIN + 1,

    // Thread Commissioner Energy Scan Result
    /** Format `Ld` - Asynchronous event only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * This property provides asynchronous `CMD_PROP_VALUE_INSERTED` updates to report energy scan results for a
     * previously sent Energy Scan Query message (please see `SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN`).
     *
     * Format is:
     *
     *   `L` : Channel mask
     *   `d` : Energy measurement data (note that `d` encoding includes the length)
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_ENERGY_SCAN_RESULT : SPINEL_PROP_MESHCOP_EXT__BEGIN + 2,

    // Thread Commissioner PAN ID Query
    /** Format `SL6` - Write only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * Writing to this property sends a PAN ID Query message with the specified parameters. Response is a
     * `LAST_STATUS` with status of operation. The PAN ID Conflict results are emitted asynchronously through
     * `SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_CONFLICT_RESULT` updates.
     *
     * Format is:
     *
     *   `S` : PAN ID to query
     *   `L` : Channel mask
     *   `6` : IPv6 destination
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_QUERY : SPINEL_PROP_MESHCOP_EXT__BEGIN + 3,

    // Thread Commissioner PAN ID Conflict Result
    /** Format `SL` - Asynchronous event only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * This property provides asynchronous `CMD_PROP_VALUE_INSERTED` updates to report PAN ID conflict results for a
     * previously sent PAN ID Query message (please see `SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_QUERY`).
     *
     * Format is:
     *
     *   `S` : The PAN ID
     *   `L` : Channel mask
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_PAN_ID_CONFLICT_RESULT : SPINEL_PROP_MESHCOP_EXT__BEGIN + 4,

    // Thread Commissioner Send MGMT_COMMISSIONER_GET
    /** Format `d` - Write only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * Writing to this property sends a MGMT_COMMISSIONER_GET message with the specified parameters. Response is a
     * `LAST_STATUS` with status of operation.
     *
     * Format is:
     *
     *   `d` : List of TLV types to get
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_MGMT_GET : SPINEL_PROP_MESHCOP_EXT__BEGIN + 5,

    // Thread Commissioner Send MGMT_COMMISSIONER_SET
    /** Format `d` - Write only
     *
     * Required capability: SPINEL_CAP_THREAD_COMMISSIONER
     *
     * Writing to this property sends a MGMT_COMMISSIONER_SET message with the specified parameters. Response is a
     * `LAST_STATUS` with status of operation.
     *
     * Format is:
     *
     *   `d` : TLV encoded data
     *
     */
    SPINEL_PROP_MESHCOP_COMMISSIONER_MGMT_SET : SPINEL_PROP_MESHCOP_EXT__BEGIN + 6,

    SPINEL_PROP_MESHCOP_EXT__END : 0x1900,

    SPINEL_PROP_OPENTHREAD__BEGIN : 0x1900,

    /// Channel Manager - Channel Change New Channel
    /** Format: `C` (read-write)
     *
     * Required capability: SPINEL_CAP_CHANNEL_MANAGER
     *
     * Setting this property triggers the Channel Manager to start
     * a channel change process. The network switches to the given
     * channel after the specified delay (see `CHANNEL_MANAGER_DELAY`).
     *
     * A subsequent write to this property will cancel an ongoing
     * (previously requested) channel change.
     *
     */
    SPINEL_PROP_CHANNEL_MANAGER_NEW_CHANNEL : SPINEL_PROP_OPENTHREAD__BEGIN + 0,

    /// Channel Manager - Channel Change Delay
    /** Format 'S'
     *  Units: seconds
     *
     * Required capability: SPINEL_CAP_CHANNEL_MANAGER
     *
     * This property specifies the delay (in seconds) to be used for
     * a channel change request.
     *
     * The delay should preferably be longer than maximum data poll
     * interval used by all sleepy-end-devices within the Thread
     * network.
     *
     */
    SPINEL_PROP_CHANNEL_MANAGER_DELAY : SPINEL_PROP_OPENTHREAD__BEGIN + 1,

    /// Channel Manager Supported Channels
    /** Format 'A(C)'
     *
     * Required capability: SPINEL_CAP_CHANNEL_MANAGER
     *
     * This property specifies the list of supported channels.
     *
     */
    SPINEL_PROP_CHANNEL_MANAGER_SUPPORTED_CHANNELS : SPINEL_PROP_OPENTHREAD__BEGIN + 2,

    /// Channel Manager Favored Channels
    /** Format 'A(C)'
     *
     * Required capability: SPINEL_CAP_CHANNEL_MANAGER
     *
     * This property specifies the list of favored channels (when `ChannelManager` is asked to select channel)
     *
     */
    SPINEL_PROP_CHANNEL_MANAGER_FAVORED_CHANNELS : SPINEL_PROP_OPENTHREAD__BEGIN + 3,

    /// Channel Manager Channel Select Trigger
    /** Format 'b'
     *
     * Required capability: SPINEL_CAP_CHANNEL_MANAGER
     *
     * Writing to this property triggers a request on `ChannelManager` to select a new channel.
     *
     * Once a Channel Select is triggered, the Channel Manager will perform the following 3 steps:
     *
     * 1) `ChannelManager` decides if the channel change would be helpful. This check can be skipped if in the input
     *    boolean to this property is set to `true` (skipping the quality check).
     *    This step uses the collected link quality metrics on the device such as CCA failure rate, frame and message
     *    error rates per neighbor, etc. to determine if the current channel quality is at the level that justifies
     *    a channel change.
     *
     * 2) If first step passes, then `ChannelManager` selects a potentially better channel. It uses the collected
     *    channel quality data by `ChannelMonitor` module. The supported and favored channels are used at this step.
     *
     * 3) If the newly selected channel is different from the current channel, `ChannelManager` requests/starts the
     *    channel change process.
     *
     * Reading this property always yields `false`.
     *
     */
    SPINEL_PROP_CHANNEL_MANAGER_CHANNEL_SELECT : SPINEL_PROP_OPENTHREAD__BEGIN + 4,

    /// Channel Manager Auto Channel Selection Enabled
    /** Format 'b'
     *
     * Required capability: SPINEL_CAP_CHANNEL_MANAGER
     *
     * This property indicates if auto-channel-selection functionality is enabled/disabled on `ChannelManager`.
     *
     * When enabled, `ChannelManager` will periodically checks and attempts to select a new channel. The period interval
     * is specified by `SPINEL_PROP_CHANNEL_MANAGER_AUTO_SELECT_INTERVAL`.
     *
     */
    SPINEL_PROP_CHANNEL_MANAGER_AUTO_SELECT_ENABLED : SPINEL_PROP_OPENTHREAD__BEGIN + 5,

    /// Channel Manager Auto Channel Selection Interval
    /** Format 'L'
     *  units: seconds
     *
     * Required capability: SPINEL_CAP_CHANNEL_MANAGER
     *
     * This property specifies the auto-channel-selection check interval (in seconds).
     *
     */
    SPINEL_PROP_CHANNEL_MANAGER_AUTO_SELECT_INTERVAL : SPINEL_PROP_OPENTHREAD__BEGIN + 6,

    /// Thread network time.
    /** Format: `Xc` - Read only
     *
     * Data per item is:
     *
     *  `X`: The Thread network time, in microseconds.
     *  `c`: Time synchronization status.
     *
     */
    SPINEL_PROP_THREAD_NETWORK_TIME : SPINEL_PROP_OPENTHREAD__BEGIN + 7,

    /// Thread time synchronization period
    /** Format: `S` - Read-Write
     *
     * Data per item is:
     *
     *  `S`: Time synchronization period, in seconds.
     *
     */
    SPINEL_PROP_TIME_SYNC_PERIOD : SPINEL_PROP_OPENTHREAD__BEGIN + 8,

    /// Thread Time synchronization XTAL accuracy threshold for Router
    /** Format: `S` - Read-Write
     *
     * Data per item is:
     *
     *  `S`: The XTAL accuracy threshold for Router, in PPM.
     *
     */
    SPINEL_PROP_TIME_SYNC_XTAL_THRESHOLD : SPINEL_PROP_OPENTHREAD__BEGIN + 9,

    /// Child Supervision Interval
    /** Format: `S` - Read-Write
     *  Units: Seconds
     *
     * Required capability: `SPINEL_CAP_CHILD_SUPERVISION`
     *
     * The child supervision interval (in seconds). Zero indicates that child supervision is disabled.
     *
     * When enabled, Child supervision feature ensures that at least one message is sent to every sleepy child within
     * the given supervision interval. If there is no other message, a supervision message (a data message with empty
     * payload) is enqueued and sent to the child.
     *
     * This property is available for FTD build only.
     *
     */
    SPINEL_PROP_CHILD_SUPERVISION_INTERVAL : SPINEL_PROP_OPENTHREAD__BEGIN + 10,

    /// Child Supervision Check Timeout
    /** Format: `S` - Read-Write
     *  Units: Seconds
     *
     * Required capability: `SPINEL_CAP_CHILD_SUPERVISION`
     *
     * The child supervision check timeout interval (in seconds). Zero indicates supervision check on the child is
     * disabled.
     *
     * Supervision check is only applicable on a sleepy child. When enabled, if the child does not hear from its parent
     * within the specified check timeout, it initiates a re-attach process by starting an MLE Child Update
     * Request/Response exchange with the parent.
     *
     * This property is available for FTD and MTD builds.
     *
     */
    SPINEL_PROP_CHILD_SUPERVISION_CHECK_TIMEOUT : SPINEL_PROP_OPENTHREAD__BEGIN + 11,

    SPINEL_PROP_OPENTHREAD__END : 0x2000,

    SPINEL_PROP_INTERFACE__BEGIN : 0x100,

    /// UART Bitrate
    /** Format: `L`
     *
     *  If the NCP is using a UART to communicate with the host,
     *  this property allows the host to change the bitrate
     *  of the serial connection. The value encoding is `L`,
     *  which is a little-endian 32-bit unsigned integer.
     *  The host should not assume that all possible numeric values
     *  are supported.
     *
     *  If implemented by the NCP, this property should be persistent
     *  across software resets and forgotten upon hardware resets.
     *
     *  This property is only implemented when a UART is being
     *  used for Spinel. This property is optional.
     *
     *  When changing the bitrate, all frames will be received
     *  at the previous bitrate until the response frame to this command
     *  is received. Once a successful response frame is received by
     *  the host, all further frames will be transmitted at the new
     *  bitrate.
     */
    SPINEL_PROP_UART_BITRATE : SPINEL_PROP_INTERFACE__BEGIN + 0,

    /// UART Software Flow Control
    /** Format: `b`
     *
     *  If the NCP is using a UART to communicate with the host,
     *  this property allows the host to determine if software flow
     *  control (XON/XOFF style) should be used and (optionally) to
     *  turn it on or off.
     *
     *  This property is only implemented when a UART is being
     *  used for Spinel. This property is optional.
     */
    SPINEL_PROP_UART_XON_XOFF : SPINEL_PROP_INTERFACE__BEGIN + 1,

    SPINEL_PROP_INTERFACE__END : 0x200,

    SPINEL_PROP_15_4_PIB__BEGIN : 0x400,
    // For direct access to the 802.15.4 PID.
    // Individual registers are fetched using
    // `SPINEL_PROP_15_4_PIB__BEGIN+[PIB_IDENTIFIER]`
    // Only supported if SPINEL_CAP_15_4_PIB is set.
    //
    // For brevity, the entire 802.15.4 PIB space is
    // not defined here, but a few choice attributes
    // are defined for illustration and convenience.
    SPINEL_PROP_15_4_PIB_PHY_CHANNELS_SUPPORTED : SPINEL_PROP_15_4_PIB__BEGIN + 0x01, ///< [A(L)]
    SPINEL_PROP_15_4_PIB_MAC_PROMISCUOUS_MODE   : SPINEL_PROP_15_4_PIB__BEGIN + 0x51, ///< [b]
    SPINEL_PROP_15_4_PIB_MAC_SECURITY_ENABLED   : SPINEL_PROP_15_4_PIB__BEGIN + 0x5d, ///< [b]
    SPINEL_PROP_15_4_PIB__END                   : 0x500,

    SPINEL_PROP_CNTR__BEGIN : 0x500,

    /// Counter reset behavior
    /** Format: `C`
     *  Writing a '1' to this property will reset
     *  all of the counters to zero. */
    SPINEL_PROP_CNTR_RESET : SPINEL_PROP_CNTR__BEGIN + 0,

    /// The total number of transmissions.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_TOTAL : SPINEL_PROP_CNTR__BEGIN + 1,

    /// The number of transmissions with ack request.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_ACK_REQ : SPINEL_PROP_CNTR__BEGIN + 2,

    /// The number of transmissions that were acked.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_ACKED : SPINEL_PROP_CNTR__BEGIN + 3,

    /// The number of transmissions without ack request.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_NO_ACK_REQ : SPINEL_PROP_CNTR__BEGIN + 4,

    /// The number of transmitted data.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_DATA : SPINEL_PROP_CNTR__BEGIN + 5,

    /// The number of transmitted data poll.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_DATA_POLL : SPINEL_PROP_CNTR__BEGIN + 6,

    /// The number of transmitted beacon.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_BEACON : SPINEL_PROP_CNTR__BEGIN + 7,

    /// The number of transmitted beacon request.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_BEACON_REQ : SPINEL_PROP_CNTR__BEGIN + 8,

    /// The number of transmitted other types of frames.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_OTHER : SPINEL_PROP_CNTR__BEGIN + 9,

    /// The number of retransmission times.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_RETRY : SPINEL_PROP_CNTR__BEGIN + 10,

    /// The number of CCA failure times.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_ERR_CCA : SPINEL_PROP_CNTR__BEGIN + 11,

    /// The number of unicast packets transmitted.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_UNICAST : SPINEL_PROP_CNTR__BEGIN + 12,

    /// The number of broadcast packets transmitted.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_PKT_BROADCAST : SPINEL_PROP_CNTR__BEGIN + 13,

    /// The number of frame transmission failures due to abort error.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_ERR_ABORT : SPINEL_PROP_CNTR__BEGIN + 14,

    /// The total number of received packets.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_TOTAL : SPINEL_PROP_CNTR__BEGIN + 100,

    /// The number of received data.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_DATA : SPINEL_PROP_CNTR__BEGIN + 101,

    /// The number of received data poll.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_DATA_POLL : SPINEL_PROP_CNTR__BEGIN + 102,

    /// The number of received beacon.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_BEACON : SPINEL_PROP_CNTR__BEGIN + 103,

    /// The number of received beacon request.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_BEACON_REQ : SPINEL_PROP_CNTR__BEGIN + 104,

    /// The number of received other types of frames.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_OTHER : SPINEL_PROP_CNTR__BEGIN + 105,

    /// The number of received packets filtered by whitelist.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_FILT_WL : SPINEL_PROP_CNTR__BEGIN + 106,

    /// The number of received packets filtered by destination check.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_FILT_DA : SPINEL_PROP_CNTR__BEGIN + 107,

    /// The number of received packets that are empty.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_ERR_EMPTY : SPINEL_PROP_CNTR__BEGIN + 108,

    /// The number of received packets from an unknown neighbor.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_ERR_UKWN_NBR : SPINEL_PROP_CNTR__BEGIN + 109,

    /// The number of received packets whose source address is invalid.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_ERR_NVLD_SADDR : SPINEL_PROP_CNTR__BEGIN + 110,

    /// The number of received packets with a security error.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_ERR_SECURITY : SPINEL_PROP_CNTR__BEGIN + 111,

    /// The number of received packets with a checksum error.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_ERR_BAD_FCS : SPINEL_PROP_CNTR__BEGIN + 112,

    /// The number of received packets with other errors.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_ERR_OTHER : SPINEL_PROP_CNTR__BEGIN + 113,

    /// The number of received duplicated.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_DUP : SPINEL_PROP_CNTR__BEGIN + 114,

    /// The number of unicast packets received.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_UNICAST : SPINEL_PROP_CNTR__BEGIN + 115,

    /// The number of broadcast packets received.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_PKT_BROADCAST : SPINEL_PROP_CNTR__BEGIN + 116,

    /// The total number of secure transmitted IP messages.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_IP_SEC_TOTAL : SPINEL_PROP_CNTR__BEGIN + 200,

    /// The total number of insecure transmitted IP messages.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_IP_INSEC_TOTAL : SPINEL_PROP_CNTR__BEGIN + 201,

    /// The number of dropped (not transmitted) IP messages.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_IP_DROPPED : SPINEL_PROP_CNTR__BEGIN + 202,

    /// The total number of secure received IP message.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_IP_SEC_TOTAL : SPINEL_PROP_CNTR__BEGIN + 203,

    /// The total number of insecure received IP message.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_IP_INSEC_TOTAL : SPINEL_PROP_CNTR__BEGIN + 204,

    /// The number of dropped received IP messages.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_IP_DROPPED : SPINEL_PROP_CNTR__BEGIN + 205,

    /// The number of transmitted spinel frames.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_TX_SPINEL_TOTAL : SPINEL_PROP_CNTR__BEGIN + 300,

    /// The number of received spinel frames.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_SPINEL_TOTAL : SPINEL_PROP_CNTR__BEGIN + 301,

    /// The number of received spinel frames with error.
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_SPINEL_ERR : SPINEL_PROP_CNTR__BEGIN + 302,

    /// Number of out of order received spinel frames (tid increase by more than 1).
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_RX_SPINEL_OUT_OF_ORDER_TID : SPINEL_PROP_CNTR__BEGIN + 303,

    /// The number of successful Tx IP packets
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_IP_TX_SUCCESS : SPINEL_PROP_CNTR__BEGIN + 304,

    /// The number of successful Rx IP packets
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_IP_RX_SUCCESS : SPINEL_PROP_CNTR__BEGIN + 305,

    /// The number of failed Tx IP packets
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_IP_TX_FAILURE : SPINEL_PROP_CNTR__BEGIN + 306,

    /// The number of failed Rx IP packets
    /** Format: `L` (Read-only) */
    SPINEL_PROP_CNTR_IP_RX_FAILURE : SPINEL_PROP_CNTR__BEGIN + 307,

    /// The message buffer counter info
    /** Format: `SSSSSSSSSSSSSSSS` (Read-only)
     *      `S`, (TotalBuffers)           The number of buffers in the pool.
     *      `S`, (FreeBuffers)            The number of free message buffers.
     *      `S`, (6loSendMessages)        The number of messages in the 6lo send queue.
     *      `S`, (6loSendBuffers)         The number of buffers in the 6lo send queue.
     *      `S`, (6loReassemblyMessages)  The number of messages in the 6LoWPAN reassembly queue.
     *      `S`, (6loReassemblyBuffers)   The number of buffers in the 6LoWPAN reassembly queue.
     *      `S`, (Ip6Messages)            The number of messages in the IPv6 send queue.
     *      `S`, (Ip6Buffers)             The number of buffers in the IPv6 send queue.
     *      `S`, (MplMessages)            The number of messages in the MPL send queue.
     *      `S`, (MplBuffers)             The number of buffers in the MPL send queue.
     *      `S`, (MleMessages)            The number of messages in the MLE send queue.
     *      `S`, (MleBuffers)             The number of buffers in the MLE send queue.
     *      `S`, (ArpMessages)            The number of messages in the ARP send queue.
     *      `S`, (ArpBuffers)             The number of buffers in the ARP send queue.
     *      `S`, (CoapMessages)           The number of messages in the CoAP send queue.
     *      `S`, (CoapBuffers)            The number of buffers in the CoAP send queue.
     */
    SPINEL_PROP_MSG_BUFFER_COUNTERS : SPINEL_PROP_CNTR__BEGIN + 400,

    /// All MAC related counters.
    /** Format: t(A(L))t(A(L))  (Read-only)
     *
     * The contents include two structs, first one corresponds to
     * all transmit related MAC counters, second one provides the
     * receive related counters.
     *
     * The transmit structure includes:
     *
     *   'L': TxTotal              (The total number of transmissions).
     *   'L': TxUnicast            (The total number of unicast transmissions).
     *   'L': TxBroadcast          (The total number of broadcast transmissions).
     *   'L': TxAckRequested       (The number of transmissions with ack request).
     *   'L': TxAcked              (The number of transmissions that were acked).
     *   'L': TxNoAckRequested     (The number of transmissions without ack request).
     *   'L': TxData               (The number of transmitted data).
     *   'L': TxDataPoll           (The number of transmitted data poll).
     *   'L': TxBeacon             (The number of transmitted beacon).
     *   'L': TxBeaconRequest      (The number of transmitted beacon request).
     *   'L': TxOther              (The number of transmitted other types of frames).
     *   'L': TxRetry              (The number of retransmission times).
     *   'L': TxErrCca             (The number of CCA failure times).
     *   'L': TxErrAbort           (The number of frame transmission failures due to abort error).
     *   'L': TxErrBusyChannel     (The number of frames that were dropped due to a busy channel).
     *
     * The receive structure includes:
     *
     *   'L': RxTotal              (The total number of received packets).
     *   'L': RxUnicast            (The total number of unicast packets received).
     *   'L': RxBroadcast          (The total number of broadcast packets received).
     *   'L': RxData               (The number of received data).
     *   'L': RxDataPoll           (The number of received data poll).
     *   'L': RxBeacon             (The number of received beacon).
     *   'L': RxBeaconRequest      (The number of received beacon request).
     *   'L': RxOther              (The number of received other types of frames).
     *   'L': RxAddressFiltered    (The number of received packets filtered by address filter (whitelist or blacklist)).
     *   'L': RxDestAddrFiltered   (The number of received packets filtered by destination check).
     *   'L': RxDuplicated         (The number of received duplicated packets).
     *   'L': RxErrNoFrame         (The number of received packets with no or malformed content).
     *   'L': RxErrUnknownNeighbor (The number of received packets from unknown neighbor).
     *   'L': RxErrInvalidSrcAddr  (The number of received packets whose source address is invalid).
     *   'L': RxErrSec             (The number of received packets with security error).
     *   'L': RxErrFcs             (The number of received packets with FCS error).
     *   'L': RxErrOther           (The number of received packets with other error).
     */
    SPINEL_PROP_CNTR_ALL_MAC_COUNTERS : SPINEL_PROP_CNTR__BEGIN + 401,

    SPINEL_PROP_CNTR__END : 0x800,

    SPINEL_PROP_NEST__BEGIN : 0x3BC0,

    SPINEL_PROP_NEST_STREAM_MFG : SPINEL_PROP_NEST__BEGIN + 0,

    /// The legacy network ULA prefix (8 bytes)
    /** Format: 'D' */
    SPINEL_PROP_NEST_LEGACY_ULA_PREFIX : SPINEL_PROP_NEST__BEGIN + 1,

    /// The EUI64 of last node joined using legacy protocol (if none, all zero EUI64 is returned).
    /** Format: 'E' */
    SPINEL_PROP_NEST_LEGACY_LAST_NODE_JOINED : SPINEL_PROP_NEST__BEGIN + 2,

    SPINEL_PROP_NEST__END : 0x3C00,

    SPINEL_PROP_VENDOR__BEGIN : 0x3C00,
    SPINEL_PROP_VENDOR__END   : 0x4000,

    SPINEL_PROP_DEBUG__BEGIN : 0x4000,

    /// Testing platform assert
    /** Format: 'b' (read-only)
     *
     * Reading this property will cause an assert on the NCP. This is intended for testing the assert functionality of
     * underlying platform/NCP. Assert should ideally cause the NCP to reset, but if this is not supported a `false`
     * boolean is returned in response.
     *
     */
    SPINEL_PROP_DEBUG_TEST_ASSERT : SPINEL_PROP_DEBUG__BEGIN + 0,

    /// The NCP log level.
    /** Format: `C` */
    SPINEL_PROP_DEBUG_NCP_LOG_LEVEL : SPINEL_PROP_DEBUG__BEGIN + 1,

    /// Testing platform watchdog
    /** Format: Empty  (read-only)
     *
     * Reading this property will causes NCP to start a `while(true) ;` loop and thus triggering a watchdog.
     *
     * This is intended for testing the watchdog functionality on the underlying platform/NCP.
     *
     */
    SPINEL_PROP_DEBUG_TEST_WATCHDOG : SPINEL_PROP_DEBUG__BEGIN + 2,

    SPINEL_PROP_DEBUG__END : 0x4400,

    SPINEL_PROP_EXPERIMENTAL__BEGIN : 2000000,
    SPINEL_PROP_EXPERIMENTAL__END   : 2097152,
};

exports.getPropertyName = function(id)
{
    for (let name in exports.kProperty) {
        if (name.endsWith('__BEGIN') || name.endsWith('__END')) continue;
        if (exports.kProperty[name] == id) return name;
    }

    return '__not_found__';
}

