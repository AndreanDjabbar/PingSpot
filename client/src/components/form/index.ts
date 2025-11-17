import ImageField from './ImageField';
import ButtonSubmit from './ButtonSubmit';
import DateTimeField from './DateTimeField';
import InputField from './InputField';
import RadioField from './RadioField';
import TextAreaField from './TextaAreaField';
import MultipleImageField from './MultipleImageField';
import CheckboxField from './CheckboxField';
import SelectField from './SelectField';

export {
    ImageField,
    ButtonSubmit,
    DateTimeField,
    InputField,
    RadioField,
    TextAreaField,
    MultipleImageField,
    CheckboxField,
    SelectField
};

export type CheckboxOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

export type SelectOption = {
    value: string;
    label: string;
};
