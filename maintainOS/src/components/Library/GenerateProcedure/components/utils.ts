import type { ConditionData } from "../types";

export function checkCondition(
  condition: ConditionData,
  parentAnswer: any
): boolean {
  const op = condition.conditionOperator || condition.type;

  // Handle Object Answers (e.g. Inspection Check returns { status: 'pass' })
  let valToCheck = parentAnswer;
  if (typeof parentAnswer === "object" && parentAnswer !== null && "status" in parentAnswer) {
    valToCheck = parentAnswer.status;
  }

  if (valToCheck === undefined || valToCheck === null || valToCheck === "") {
    return op === "is not checked" || op === "is_not_checked";
  }

  const val = condition.conditionValue || condition.value;
  const values = condition.values;

  if (op === "is") return valToCheck === val;
  if (op === "one_of") return values?.includes(valToCheck);
  if (op === "is not") return valToCheck !== val;
  if (op === "not_one_of") return !values?.includes(valToCheck);
  if (op === "is checked" || op === "is_checked") return valToCheck === true;
  if (op === "is not checked" || op === "is_not_checked") return valToCheck === false;
  if (op === "contains") return Array.isArray(valToCheck) && valToCheck.includes(val);
  if (op === "does not contain") return !Array.isArray(valToCheck) || !valToCheck.includes(val);

  const numAnswer = parseFloat(valToCheck);
  const numVal = parseFloat(val || "");
  const numVal2 = parseFloat(condition.conditionValue2 || condition.value2 || "");

  if (isNaN(numAnswer)) return false;

  if (op === "higher than" || op === "higher_than") return numAnswer > numVal;
  if (op === "lower than" || op === "lower_than") return numAnswer < numVal;
  if (op === "equal to" || op === "equal_to") return numAnswer === numVal;
  if (op === "not equal to" || op === "not_equal_to") return numAnswer !== numVal;
  if (op === "between") {
    if (isNaN(numVal) || isNaN(numVal2)) return false;
    const min = Math.min(numVal, numVal2);
    const max = Math.max(numVal, numVal2);
    return numAnswer >= min && numAnswer <= max;
  }
  return false;
}