import { useState, useEffect } from "react";
import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd";
import { useCountries } from "../../../hooks/useCountries";
import { getPhoneValidator } from "../../../utils/phoneRules";
import "./styles.scss";

interface CountryPhoneInputProps {
  form:         FormInstance<any>;
  /** form field name that holds the phone number */
  name:         string;
  /** form field name that holds the resolved dial code (default: "countryCode") */
  countryName?: string;
  label?:       string;
  required?:    boolean;
  placeholder?: string;
}

/**
 * Reusable phone input with a searchable country-code selector and
 * country-wise validation. Stores the phone in `name` and the resolved
 * dial code (e.g. "+91") in `countryName`.
 */
const CountryPhoneInput = ({
  form,
  name,
  countryName = "countryCode",
  label = "Phone Number",
  required = true,
  placeholder = "Enter phone number",
}: CountryPhoneInputProps) => {
  const { countryOptions } = useCountries();

  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    try { return (typeof window !== "undefined" && window?.localStorage?.getItem("selectedCountry")) || "IN"; }
    catch { return "IN"; }
  });

  // keep the hidden dial-code field in sync + re-validate the number
  useEffect(() => {
    const found = countryOptions.find(c => c.value === selectedCountry);
    form.setFieldValue(countryName, found?.dial || selectedCountry);
    form.validateFields([name]).catch(() => {});
  }, [selectedCountry, countryOptions, form, name, countryName]);

  const selected = countryOptions.find(c => c.value === selectedCountry);

  return (
    <>
      <Form.Item name={countryName} hidden>
        <Input />
      </Form.Item>

      <Form.Item label={label}>
        <div className="country-phone">
          <div className="cc-selected-wrapper">
            {selected?.flag
              ? <img src={selected.flag} alt={selected.name} className="cc-flag" />
              : <div className="cc-flag-placeholder" />}
            <Select
              showSearch
              value={selectedCountry}
              placeholder="+91"
              optionLabelProp="data-code"
              popupClassName="country-code-dropdown"
              variant="borderless"
              onChange={(val: string) => {
                setSelectedCountry(val);
                try { window.localStorage.setItem("selectedCountry", val); } catch { /* ignore */ }
              }}
              filterOption={(input, option) => {
                const val = (option?.value as string) || "";
                return val.toLowerCase().includes(input.toLowerCase());
              }}
              style={{ width: 64, border: "none", paddingInline: 0 }}
            >
              {countryOptions.map(co => (
                <Select.Option key={co.value} value={co.value} data-code={co.value}>
                  <span className="cc-option">
                    {co.flag && <img src={co.flag} alt={co.name} style={{ width: 20, height: 14, objectFit: "cover", marginRight: 8, verticalAlign: "middle" }} />}
                    {co.labelText}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </div>
          <Form.Item
            name={name}
            noStyle
            rules={[
              ...(required ? [{ required: true, message: "Please enter phone number" }] : []),
              { validator: getPhoneValidator(selectedCountry) },
            ]}
          >
            <Input variant="borderless" className="cc-input" placeholder={placeholder} />
          </Form.Item>
        </div>
      </Form.Item>
    </>
  );
};

export default CountryPhoneInput;
