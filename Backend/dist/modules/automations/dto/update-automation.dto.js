"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAutomationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_automation_dto_1 = require("./create-automation.dto");
class UpdateAutomationDto extends (0, mapped_types_1.PartialType)(create_automation_dto_1.CreateAutomationDto) {
}
exports.UpdateAutomationDto = UpdateAutomationDto;
