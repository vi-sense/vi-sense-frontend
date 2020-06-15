/**
 * @author Tom Wendland
 * Storage Keys
 * Use only <string, number> pairs for now otherwise length calculation can be faulty
 * Dont use the IDs directly, only use the enum keys
 */
enum SKEYS {
    SELECTED_SENSOR=0,
    SELECTED_TIME=1,
    CAMERA_DRIVE_SENSOR=2,
    INIT_SENSOR=3,
    __LENGTH = Object.keys(SKEYS).length/2
}
export default SKEYS