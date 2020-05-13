/**
 * @author Tom Wendland
 * Use only <string, number> pairs for now otherwise length calculation can be faulty
 * Dont use the IDs directly, only use the enum keys
 */
enum STATES {
    SELECTED_SENSOR=0,
    SELECTED_TIME=1,
    __LENGTH = Object.keys(STATES).length / 2
}
export default STATES